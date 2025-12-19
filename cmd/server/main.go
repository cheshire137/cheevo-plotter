package main

import (
	"context"
	"database/sql"
	"flag"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/cheshire137/cheevo-plotter/pkg/config"
	"github.com/cheshire137/cheevo-plotter/pkg/data_store"
	"github.com/cheshire137/cheevo-plotter/pkg/server"
	"github.com/cheshire137/cheevo-plotter/pkg/util"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	var configPath string
	flag.StringVar(&configPath, "config", "config.yml", "Path to YAML configuration file; defaults to config.yml")
	flag.Parse()

	util.LogInfo("Using config file %s", configPath)
	cfg, err := config.NewConfig(configPath)
	if err != nil {
		util.LogError("Failed to load configuration:", err)
		return
	}
	util.LogInfo("Using frontend port: %d", cfg.FrontendPort)

	db, err := sql.Open("sqlite3", cfg.DatabaseFile)
	if err != nil {
		util.LogError("Failed to open database:", err)
		return
	}
	util.LogSuccess("Loaded %s database", cfg.DatabaseFile)
	defer db.Close()

	dataStore := data_store.NewDataStore(db)
	err = dataStore.CreateTables()
	if err != nil {
		util.LogError("Failed to create tables:", err)
		return
	}

	mux := http.NewServeMux()
	env, err := server.NewEnv(dataStore, cfg)
	if err != nil {
		util.LogError("Failed to create server environment:", err)
		return
	}

	err = env.SyncSteamAppsIfNecessary()
	if err != nil {
		util.LogError("Failed to sync Steam apps:", err)
		return
	}

	mux.Handle("/", http.FileServer(http.Dir("./ui/build/")))

	mux.Handle("GET /api/steam-apps", http.HandlerFunc(env.GetSteamAppsHandler))
	mux.Handle("OPTIONS /api/steam-apps", http.HandlerFunc(env.OptionsHandler))

	mux.Handle("GET /api/steam-player-summaries", http.HandlerFunc(env.GetSteamPlayerSummariesHandler))
	mux.Handle("OPTIONS /api/steam-player-summaries", http.HandlerFunc(env.OptionsHandler))

	server := &http.Server{Addr: cfg.BackendAddress(), Handler: mux}

	util.LogInfo("Starting server at http://localhost:%d", cfg.BackendPort)
	go func(srv *http.Server) {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			util.LogError("Could not start server:", err)
		}
	}(server)

	stopSignal := make(chan os.Signal, 1)
	signal.Notify(stopSignal, syscall.SIGINT, syscall.SIGTERM)
	<-stopSignal

	shutdownServer(server)
}

func shutdownServer(server *http.Server) {
	util.LogInfo("Stopping server...")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := server.Shutdown(shutdownCtx); err != nil {
		util.LogError("Could not cleanly stop server:", err)
	}
}

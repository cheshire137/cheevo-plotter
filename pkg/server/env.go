package server

import (
	"fmt"
	"net/http"
	"time"

	"github.com/cheshire137/cheevo-plotter/pkg/config"
	"github.com/cheshire137/cheevo-plotter/pkg/data_store"
	"github.com/cheshire137/cheevo-plotter/pkg/steam"
	"github.com/cheshire137/cheevo-plotter/pkg/util"
)

type Env struct {
	ds     *data_store.DataStore
	config *config.Config
}

func NewEnv(ds *data_store.DataStore, config *config.Config) (*Env, error) {
	return &Env{ds: ds, config: config}, nil
}

func (e *Env) SyncSteamAppsIfNecessary() error {
	lastSynced, err := e.ds.GetSteamAppsSyncTime()
	if err != nil {
		return fmt.Errorf("failed to get Steam apps sync time: %w", err)
	}

	if lastSynced == nil || time.Since(*lastSynced) > 24*time.Hour {
		util.LogInfo("fetching Steam apps")
		client := steam.NewClient(e.config.SteamApiKey)

		apps, err := client.GetAppList()
		if err != nil {
			return fmt.Errorf("failed to load all Steam apps: %w", err)
		}

		allItemsSaved := len(apps) > 0
		for _, app := range apps {
			err := e.ds.AddSteamApp(app)
			if err != nil {
				allItemsSaved = false
				util.LogError("Failed to save Steam app " + app.Id + ": " + err.Error())
			}
		}

		if allItemsSaved {
			err = e.ds.SetSteamAppsSyncTime(time.Now())
			if err != nil {
				return fmt.Errorf("failed to set Steam apps sync time: %w", err)
			}
		}
	} else {
		util.LogInfo("Loading Steam apps from database, last synced " + lastSynced.String())
	}

	return nil
}

func (e *Env) redirectToFrontend(w http.ResponseWriter, r *http.Request) {
	frontendUrl := fmt.Sprintf("http://localhost:%d", e.config.FrontendPort)
	http.Redirect(w, r, frontendUrl, http.StatusFound)
}

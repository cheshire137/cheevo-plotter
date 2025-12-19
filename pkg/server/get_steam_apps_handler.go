package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/cheshire137/cheevo-plotter/pkg/data_store"
	"github.com/cheshire137/cheevo-plotter/pkg/steam"
	"github.com/cheshire137/cheevo-plotter/pkg/util"
)

type SteamAppsResponse struct {
	SteamApps []*data_store.SteamApp `json:"steamApps"`
}

func (e *Env) GetSteamAppsHandler(w http.ResponseWriter, r *http.Request) {
	util.LogRequest(r)
	e.enableCors(&w)

	err := e.syncSteamAppsIfNecessary()
	if err != nil {
		ErrorJson(w, err)
		return
	}

	lastAppId := r.URL.Query().Get("last_app_id")
	apps, err := e.ds.ListSteamApps(lastAppId, 100)
	if err != nil {
		ErrorJson(w, err)
		return
	}

	response := SteamAppsResponse{SteamApps: apps}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (e *Env) syncSteamAppsIfNecessary() error {
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

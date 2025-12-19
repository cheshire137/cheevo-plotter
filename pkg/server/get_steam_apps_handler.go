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

	err := e.syncSteamAppsIfNecessary(r)
	if err != nil {
		ErrorJson(w, err)
		return
	}

	apps, err := e.ds.ListSteamApps()
	if err != nil {
		ErrorJson(w, err)
		return
	}

	response := SteamAppsResponse{SteamApps: apps}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (e *Env) syncSteamAppsIfNecessary(r *http.Request) error {
	lastSynced, err := e.ds.GetSteamAppsSyncTime()
	if err != nil {
		return fmt.Errorf("failed to get Steam apps sync time: %w", err)
	}

	if lastSynced == nil || time.Since(*lastSynced) > 24*time.Hour {
		util.LogInfo("fetching Steam apps")
		client := steam.NewClient()

		_, err := client.GetAppList()
		if err != nil {
			return fmt.Errorf("failed to load all Steam apps: %w", err)
		}

		// allItemsSaved := true
		// for _, app := range apps {
		// 	libraryItem := data_store.NewLibraryItemFromAudibleItem(audibleItem)
		// 	libraryItem.UserId = userId
		// 	err := e.ds.UpsertLibraryItem(libraryItem)
		// 	if err != nil {
		// 		allItemsSaved = false
		// 		util.LogError("Failed to save library item " + libraryItem.Asin + ": " + err.Error())
		// 	}
		// }

		// if allItemsSaved {
		// 	err = e.ds.SetLibrarySyncTime(time.Now())
		// 	if err != nil {
		// 		return fmt.Errorf("failed to set library sync time: %w", err)
		// 	}
		// }
	} else {
		util.LogInfo("Loading Steam apps from database, last synced " + lastSynced.String())
	}

	return nil
}

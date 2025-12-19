package server

import (
	"encoding/json"
	"net/http"

	"github.com/cheshire137/cheevo-plotter/pkg/data_store"
	"github.com/cheshire137/cheevo-plotter/pkg/util"
)

type SteamAppsResponse struct {
	SteamApps []*data_store.SteamApp `json:"steamApps"`
}

func (e *Env) GetSteamAppsHandler(w http.ResponseWriter, r *http.Request) {
	util.LogRequest(r)
	e.enableCors(&w)

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

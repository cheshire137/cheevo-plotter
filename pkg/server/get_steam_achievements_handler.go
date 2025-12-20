package server

import (
	"encoding/json"
	"net/http"

	"github.com/cheshire137/cheevo-plotter/pkg/steam"
	"github.com/cheshire137/cheevo-plotter/pkg/util"
)

type SteamAchievementsResponse struct {
	Achievements []*steam.SteamAchievement `json:"achievements"`
}

func (e *Env) GetSteamAchievementsHandler(w http.ResponseWriter, r *http.Request) {
	util.LogRequest(r)
	e.enableCors(&w)

	steamId := r.URL.Query().Get("steamid")
	if len(steamId) < 1 {
		ErrorMessageJson(w, "steamid parameter is required", 400)
		return
	}

	appId := r.URL.Query().Get("appid")
	if len(appId) < 1 {
		ErrorMessageJson(w, "appid parameter is required", 400)
		return
	}

	client := steam.NewClient(e.config.SteamApiKey)

	achievements, err := client.GetAchievements(steamId, appId)
	if err != nil {
		ErrorJson(w, err)
		return
	}

	response := SteamAchievementsResponse{Achievements: achievements}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

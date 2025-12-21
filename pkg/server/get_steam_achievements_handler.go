package server

import (
	"encoding/json"
	"net/http"

	"github.com/cheshire137/cheevo-plotter/pkg/steam"
	"github.com/cheshire137/cheevo-plotter/pkg/util"
)

type SteamAchievementsResponse struct {
	GameSchema         *steam.SteamGameSchema          `json:"gameSchema"`
	PlayerAchievements []*steam.SteamPlayerAchievement `json:"playerAchievements"`
}

func (e *Env) GetSteamAchievementsHandler(w http.ResponseWriter, r *http.Request) {
	util.LogRequest(r)
	e.enableCors(&w)

	steamId, err := e.getCurrentSteamId(r)
	if err != nil {
		ErrorMessageJson(w, "Not authenticated", http.StatusUnauthorized)
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

	gameSchema, err := client.GetGameSchema(appId)
	if err != nil {
		ErrorJson(w, err)
		return
	}

	response := SteamAchievementsResponse{PlayerAchievements: achievements, GameSchema: gameSchema}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

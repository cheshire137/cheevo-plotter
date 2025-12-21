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

type SteamAchievementsResponse struct {
	GameSchema         *steam.SteamGameSchema               `json:"gameSchema"`
	PlayerAchievements []*data_store.SteamPlayerAchievement `json:"playerAchievements"`
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

	err = e.syncSteamPlayerAchievementsIfNecessary(steamId, appId)
	if err != nil {
		ErrorJson(w, err)
		return
	}

	achievements, err := e.ds.GetSteamPlayerAchievements(steamId, appId)
	if err != nil {
		ErrorJson(w, err)
		return
	}

	client := steam.NewClient(e.config.SteamApiKey)
	gameSchema, err := client.GetGameSchema(appId)
	if err != nil {
		ErrorJson(w, err)
		return
	}

	response := SteamAchievementsResponse{PlayerAchievements: achievements, GameSchema: gameSchema}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (e *Env) syncSteamPlayerAchievementsIfNecessary(steamId string, appId string) error {
	lastSynced, err := e.ds.GetSteamPlayerAchievementsSyncTime(steamId, appId)
	if err != nil {
		return fmt.Errorf("failed to get Steam owned games sync time for user %s for game %s: %w", steamId, appId, err)
	}

	if lastSynced == nil || time.Since(*lastSynced) > 24*time.Hour {
		util.LogInfo("fetching Steam player achievements for user " + steamId + " for game " + appId)
		client := steam.NewClient(e.config.SteamApiKey)

		achievements, err := client.GetAchievements(steamId, appId)
		if err != nil {
			return fmt.Errorf("failed to load all Steam player achievements for user %s for game %s: %w", steamId, appId, err)
		}

		allItemsSaved := len(achievements) > 0
		for _, achievementData := range achievements {
			achievement := data_store.NewSteamPlayerAchievement(steamId, appId, achievementData)
			err := e.ds.UpsertSteamPlayerAchievement(achievement)
			if err != nil {
				allItemsSaved = false
				util.LogError("Failed to save Steam player achievement " + achievement.AppId + " for user " + steamId + ": " +
					err.Error())
			}
		}

		if allItemsSaved {
			err = e.ds.SetSteamPlayerAchievementsSyncTime(steamId, appId, time.Now())
			if err != nil {
				return fmt.Errorf("failed to set Steam player achievements sync time for user %s for game %s: %w", steamId,
					appId, err)
			}
		}
	} else {
		util.LogInfo("Loading Steam player achievements from database for user " + steamId + " for game " + appId +
			" , last synced " + lastSynced.String())
	}

	return nil
}

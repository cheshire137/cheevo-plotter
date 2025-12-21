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

type SteamAchievement struct {
	Unlocked    bool   `json:"unlocked"`
	UnlockTime  string `json:"unlockTime"`
	Id          string `json:"id"`
	AppId       string `json:"appId"`
	SteamId     string `json:"steamId"`
	Name        string `json:"name"`
	IconUrl     string `json:"iconUrl"`
	GrayIconUrl string `json:"grayIconUrl"`
	Description string `json:"description"`
	Hidden      bool   `json:"hidden"`
}

type SteamAchievementsResponse struct {
	Achievements []*SteamAchievement `json:"achievements"`
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

	playerAchievements, err := e.ds.GetSteamPlayerAchievements(steamId, appId)
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

	gameAchievementsById := map[string]*steam.SteamGameAchievement{}
	for _, gameAchievement := range gameSchema.Achievements {
		gameAchievementsById[gameAchievement.Id] = gameAchievement
	}

	achievements := []*SteamAchievement{}
	for _, playerAchievement := range playerAchievements {
		if gameAchievement, ok := gameAchievementsById[playerAchievement.Id]; ok {
			achievement := newSteamAchievement(playerAchievement, gameAchievement)
			achievements = append(achievements, achievement)
		}
	}

	response := SteamAchievementsResponse{Achievements: achievements}
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

func newSteamAchievement(playerAchievement *data_store.SteamPlayerAchievement, gameAchievement *steam.SteamGameAchievement) *SteamAchievement {
	return &SteamAchievement{
		Unlocked:    playerAchievement.Unlocked,
		UnlockTime:  playerAchievement.UnlockTimeStr,
		Id:          playerAchievement.Id,
		AppId:       playerAchievement.AppId,
		SteamId:     playerAchievement.SteamId,
		Name:        gameAchievement.Name,
		IconUrl:     gameAchievement.IconUrl,
		GrayIconUrl: gameAchievement.GrayIconUrl,
		Description: gameAchievement.Description,
		Hidden:      gameAchievement.Hidden,
	}
}

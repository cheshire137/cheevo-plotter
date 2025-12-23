package server

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"sort"
	"time"

	"github.com/cheshire137/cheevo-plotter/pkg/data_store"
	"github.com/cheshire137/cheevo-plotter/pkg/steam"
	"github.com/cheshire137/cheevo-plotter/pkg/util"
)

// Keep in sync with `SteamPlayerAchievement` in ui/src/types.ts
type SteamPlayerAchievement struct {
	Unlocked   bool   `json:"unlocked"`
	UnlockTime string `json:"unlockTime"`
	Id         string `json:"id"`
	AppId      string `json:"appId"`
	SteamId    string `json:"steamId"`
}

// Keep in sync with `SteamGameAchievement` in ui/src/types.ts
type SteamGameAchievement struct {
	Id          string `json:"id"`
	AppId       string `json:"appId"`
	Name        string `json:"name"`
	IconUrl     string `json:"iconUrl"`
	GrayIconUrl string `json:"grayIconUrl"`
	Description string `json:"description"`
	Hidden      bool   `json:"hidden"`
}

type SteamAchievementsResponse struct {
	PlayerAchievementsById map[string]*SteamPlayerAchievement `json:"playerAchievementsById"`
	GameAchievements       []*SteamGameAchievement            `json:"gameAchievements"`
}

func (e *Env) GetSteamAchievementsHandler(w http.ResponseWriter, r *http.Request) {
	util.LogRequest(r)
	e.enableCors(&w)

	steamIdFromCurrentUser, err := e.getCurrentSteamId(r)
	if err != nil {
		ErrorMessageJson(w, "Not authenticated", http.StatusUnauthorized)
		return
	}

	appId := r.URL.Query().Get("appid")
	if len(appId) < 1 {
		ErrorMessageJson(w, "appid parameter is required", 400)
		return
	}

	steamIdFromParam := r.URL.Query().Get("steamid")
	var steamId string
	if len(steamIdFromParam) > 0 {
		steamId = steamIdFromParam
	} else {
		steamId = steamIdFromCurrentUser
	}

	playerAchievementsById, err := e.getCachedSteamPlayerAchievementsById(steamId, appId)
	if err != nil {
		ErrorJson(w, err)
		return
	}

	gameAchievements, err := e.getCachedSteamGameAchievements(appId)
	if err != nil {
		ErrorJson(w, err)
		return
	}

	sort.Slice(gameAchievements, func(i, j int) bool {
		gameAchievementA := gameAchievements[i]
		gameAchievementB := gameAchievements[j]
		playerAchievementA, playerHasAchievementA := playerAchievementsById[gameAchievementA.Id]
		playerAchievementB, playerHasAchievementB := playerAchievementsById[gameAchievementB.Id]
		if playerHasAchievementA && playerHasAchievementB {
			if playerAchievementA.Unlocked && playerAchievementB.Unlocked {
				return playerAchievementA.UnlockTime < playerAchievementB.UnlockTime
			}
			if playerAchievementA.Unlocked && !playerAchievementB.Unlocked {
				return true
			}
			if !playerAchievementA.Unlocked && playerAchievementB.Unlocked {
				return false
			}
		}
		if playerHasAchievementA && !playerHasAchievementB {
			return true
		}
		if !playerHasAchievementA && playerHasAchievementB {
			return false
		}
		return gameAchievementA.Name < gameAchievementB.Name
	})

	response := SteamAchievementsResponse{
		GameAchievements:       gameAchievements,
		PlayerAchievementsById: playerAchievementsById,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (e *Env) getCachedSteamPlayerAchievementsById(steamId, appId string) (map[string]*SteamPlayerAchievement, error) {
	err := e.syncSteamPlayerAchievementsIfNecessary(steamId, appId)
	if err != nil {
		return nil, err
	}

	achievements, err := e.ds.GetSteamPlayerAchievements(steamId, appId)
	if err != nil {
		return nil, err
	}

	result := make(map[string]*SteamPlayerAchievement)
	for _, achievement := range achievements {
		unlockTime, err := achievement.UnlockTime()
		var unlockTimeStr string
		if unlockTime != nil && err == nil {
			unlockTimeStr = unlockTime.Format(time.RFC3339)
		}
		result[achievement.Id] = &SteamPlayerAchievement{
			Unlocked:   achievement.Unlocked,
			UnlockTime: unlockTimeStr,
			Id:         achievement.Id,
			AppId:      achievement.AppId,
			SteamId:    achievement.SteamId,
		}
	}
	return result, nil
}

func (e *Env) getCachedSteamGameAchievements(appId string) ([]*SteamGameAchievement, error) {
	err := e.syncSteamGameAchievementsIfNecessary(appId)
	if err != nil {
		return nil, err
	}

	achievements, err := e.ds.GetSteamGameAchievements(appId)
	if err != nil {
		return nil, err
	}

	result := make([]*SteamGameAchievement, len(achievements))
	for i, achievement := range achievements {
		result[i] = &SteamGameAchievement{
			Id:          achievement.Id,
			AppId:       achievement.AppId,
			Name:        achievement.Name,
			IconUrl:     achievement.IconUrl,
			GrayIconUrl: achievement.GrayIconUrl,
			Description: achievement.Description,
			Hidden:      achievement.Hidden,
		}
	}

	return result, nil
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
			if errors.Is(err, steam.ErrForbidden) {
				util.LogInfo("Flagging Steam user " + steamId + " as having a private profile")
				privateProfileErr := e.ds.SetPrivateProfile(steamId, true)
				if privateProfileErr != nil {
					util.LogError("Failed to set private profile for Steam user " + steamId + ": " + privateProfileErr.Error())
				}
			} else if errors.Is(err, steam.ErrBadRequest) {
				// Game does not have achievements
				util.LogInfo("Flagging Steam app " + appId + " as having no achievements")
				hasAchievementsErr := e.ds.SetHasAchievements(appId, false)
				if hasAchievementsErr != nil {
					util.LogError("Failed to set Steam app " + appId + " as having no achievements: " +
						hasAchievementsErr.Error())
				}
			} else {
				return fmt.Errorf("failed to load all Steam player achievements for user %s for game %s: %w", steamId, appId, err)
			}
		}

		allItemsSaved := true
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

func (e *Env) syncSteamGameAchievementsIfNecessary(appId string) error {
	lastSynced, err := e.ds.GetSteamGameAchievementsSyncTime(appId)
	if err != nil {
		return fmt.Errorf("failed to get Steam owned games sync time for game %s: %w", appId, err)
	}

	if lastSynced == nil || time.Since(*lastSynced) > 7*24*time.Hour {
		util.LogInfo("fetching Steam game achievements for game " + appId)
		client := steam.NewClient(e.config.SteamApiKey)

		gameSchema, err := client.GetGameSchema(appId)
		if err != nil {
			return fmt.Errorf("failed to load all Steam game achievements for game %s: %w", appId, err)
		}

		allItemsSaved := true
		for _, achievementData := range gameSchema.Achievements {
			achievement := data_store.NewSteamGameAchievement(appId, achievementData)
			err := e.ds.UpsertSteamGameAchievement(achievement)
			if err != nil {
				allItemsSaved = false
				util.LogError("Failed to save Steam game achievement " + achievement.Id + ": " + err.Error())
			}
		}

		if allItemsSaved {
			err = e.ds.SetSteamGameAchievementsSyncTime(appId, time.Now())
			if err != nil {
				return fmt.Errorf("failed to set Steam game achievements sync time for game %s: %w", appId, err)
			}
		}
	} else {
		util.LogInfo("Loading Steam game achievements from database for game " + appId + " , last synced " +
			lastSynced.String())
	}

	return nil
}

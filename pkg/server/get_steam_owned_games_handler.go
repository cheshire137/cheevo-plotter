package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"time"

	"github.com/cheshire137/cheevo-plotter/pkg/data_store"
	"github.com/cheshire137/cheevo-plotter/pkg/steam"
	"github.com/cheshire137/cheevo-plotter/pkg/util"
)

type SteamOwnedGamesResponse struct {
	OwnedGames   []*data_store.SteamOwnedGame `json:"ownedGames"`
	NamesByAppId map[string]string            `json:"namesByAppId"`
}

func (e *Env) GetSteamOwnedGamesHandler(w http.ResponseWriter, r *http.Request) {
	util.LogRequest(r)
	e.enableCors(&w)

	steamId, err := e.getCurrentSteamId(r)
	if err != nil {
		ErrorMessageJson(w, "Not authenticated", http.StatusUnauthorized)
		return
	}

	err = e.syncSteamOwnedGamesIfNecessary(steamId)
	if err != nil {
		ErrorJson(w, err)
		return
	}

	ownedGames, err := e.ds.GetSteamOwnedGames(steamId)
	if err != nil {
		ErrorJson(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	appIds := make([]string, len(ownedGames))
	for i, ownedGame := range ownedGames {
		appIds[i] = ownedGame.AppId
	}

	steamApps, err := e.ds.GetSteamApps(appIds)
	if err != nil {
		ErrorJson(w, err)
		return
	}

	util.LogInfo("Found %d Steam apps", len(steamApps))
	namesByAppId := map[string]string{}
	for _, app := range steamApps {
		namesByAppId[app.Id] = app.Name
	}
	response := SteamOwnedGamesResponse{NamesByAppId: namesByAppId}

	filteredOwnedGames := []*data_store.SteamOwnedGame{}
	for _, ownedGame := range ownedGames {
		if _, ok := namesByAppId[ownedGame.AppId]; ok {
			filteredOwnedGames = append(filteredOwnedGames, ownedGame)
		}
	}

	sort.Slice(filteredOwnedGames, func(i, j int) bool {
		gameA := filteredOwnedGames[i]
		gameB := filteredOwnedGames[j]
		nameA := namesByAppId[gameA.AppId]
		nameB := namesByAppId[gameB.AppId]
		gameAPlayed := gameA.Playtime > 0
		gameBPlayed := gameB.Playtime > 0
		if gameAPlayed == gameBPlayed {
			if nameA < nameB {
				return true
			}
			return false
		}
		if gameAPlayed && !gameBPlayed {
			return true
		}
		return false
	})
	response.OwnedGames = filteredOwnedGames

	json.NewEncoder(w).Encode(response)
}

func (e *Env) syncSteamOwnedGamesIfNecessary(steamId string) error {
	lastSynced, err := e.ds.GetSteamOwnedGamesSyncTime(steamId)
	if err != nil {
		return fmt.Errorf("failed to get Steam owned games sync time for user %s: %w", steamId, err)
	}

	if lastSynced == nil || time.Since(*lastSynced) > 24*time.Hour {
		util.LogInfo("fetching Steam owned games for user " + steamId)
		client := steam.NewClient(e.config.SteamApiKey)

		ownedGames, err := client.GetOwnedGames(steamId)
		if err != nil {
			return fmt.Errorf("failed to load all Steam owned games for user %s: %w", steamId, err)
		}

		allItemsSaved := len(ownedGames) > 0
		for _, ownedGameData := range ownedGames {
			ownedGame := data_store.NewSteamOwnedGame(steamId, ownedGameData)
			err := e.ds.UpsertSteamOwnedGame(ownedGame)
			if err != nil {
				allItemsSaved = false
				util.LogError("Failed to save Steam owned game " + ownedGame.AppId + " for user " + steamId + ": " + err.Error())
			}
		}

		if allItemsSaved {
			err = e.ds.SetSteamOwnedGamesSyncTime(steamId, time.Now())
			if err != nil {
				return fmt.Errorf("failed to set Steam owned games sync time for user %s: %w", steamId, err)
			}
		}
	} else {
		util.LogInfo("Loading Steam owned games from database for user " + steamId + ", last synced " + lastSynced.String())
	}

	return nil
}

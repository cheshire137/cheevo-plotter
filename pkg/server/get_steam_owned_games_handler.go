package server

import (
	"encoding/json"
	"net/http"

	"github.com/cheshire137/cheevo-plotter/pkg/steam"
	"github.com/cheshire137/cheevo-plotter/pkg/util"
)

type SteamOwnedGamesResponse struct {
	OwnedGames   []*steam.SteamOwnedGame `json:"ownedGames"`
	NamesByAppId map[string]string       `json:"namesByAppId"`
}

func (e *Env) GetSteamOwnedGamesHandler(w http.ResponseWriter, r *http.Request) {
	util.LogRequest(r)
	e.enableCors(&w)

	steamId := r.URL.Query().Get("steamid")
	username := r.URL.Query().Get("username")
	if len(steamId) < 1 && len(username) < 1 {
		ErrorMessageJson(w, "Either steamid or username parameter is required", 400)
		return
	}

	client := steam.NewClient(e.config.SteamApiKey)

	if len(steamId) < 1 {
		var err error
		steamId, err = client.GetSteamId(username)
		if err != nil {
			ErrorJson(w, err)
			return
		}
	}

	ownedGames, err := client.GetOwnedGames(steamId)
	if err != nil {
		ErrorJson(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	response := SteamOwnedGamesResponse{OwnedGames: ownedGames}

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
	response.NamesByAppId = namesByAppId

	json.NewEncoder(w).Encode(response)
}

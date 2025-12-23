package server

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/cheshire137/cheevo-plotter/pkg/steam"
	"github.com/cheshire137/cheevo-plotter/pkg/util"
)

// Keep in sync with `SteamUser` in ui/src/types.ts
type SteamUser struct {
	SteamId        string   `json:"steamId"`
	Name           string   `json:"name"`
	AvatarUrl      string   `json:"avatarUrl"`
	ProfileUrl     string   `json:"profileUrl"`
	FriendIds      []string `json:"friendIds"`
	PrivateProfile bool     `json:"privateProfile"`
}

type SteamPlayerSummariesResponse struct {
	Players []*SteamUser `json:"players"`
}

func (e *Env) GetSteamPlayerSummariesHandler(w http.ResponseWriter, r *http.Request) {
	util.LogRequest(r)
	e.enableCors(&w)

	steamIdsStr := r.URL.Query().Get("steamids")
	if len(steamIdsStr) < 1 {
		ErrorMessageJson(w, "steamids parameter is required", 400)
		return
	}

	client := steam.NewClient(e.config.SteamApiKey)
	playerSummaries, err := client.GetPlayerSummaries(strings.Split(steamIdsStr, ","))
	if err != nil {
		ErrorJson(w, err)
		return
	}

	players := []*SteamUser{}
	for _, playerSummary := range playerSummaries {
		players = append(players, &SteamUser{
			SteamId:        playerSummary.Id,
			AvatarUrl:      playerSummary.AvatarUrl,
			Name:           playerSummary.Name,
			ProfileUrl:     playerSummary.ProfileUrl,
			FriendIds:      []string{},
			PrivateProfile: false,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	response := SteamPlayerSummariesResponse{Players: players}
	json.NewEncoder(w).Encode(response)
}

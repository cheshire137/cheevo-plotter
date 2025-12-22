package server

import (
	"encoding/json"
	"net/http"
	"sort"
	"strings"

	"github.com/cheshire137/cheevo-plotter/pkg/steam"
	"github.com/cheshire137/cheevo-plotter/pkg/util"
)

type SteamFriendsResponse struct {
	Friends []*steam.SteamPlayerSummary `json:"friends"`
}

func (e *Env) GetSteamFriendsHandler(w http.ResponseWriter, r *http.Request) {
	util.LogRequest(r)
	e.enableCors(&w)

	steamId, err := e.getCurrentSteamId(r)
	if err != nil {
		ErrorMessageJson(w, "Not authenticated", http.StatusUnauthorized)
		return
	}

	user, err := e.ds.GetSteamUser(steamId)
	if err != nil {
		ErrorJson(w, err)
		return
	}

	friends := []*steam.SteamPlayerSummary{}
	if len(user.FriendIds) > 0 {
		client := steam.NewClient(e.config.SteamApiKey)
		friends, err = client.GetPlayerSummaries(user.FriendIds)
		if err != nil {
			ErrorJson(w, err)
			return
		}
	}

	sort.Slice(friends, func(i, j int) bool {
		nameA := strings.ToLower(friends[i].Name)
		nameB := strings.ToLower(friends[j].Name)
		return nameA < nameB
	})

	w.Header().Set("Content-Type", "application/json")
	response := SteamFriendsResponse{Friends: friends}
	json.NewEncoder(w).Encode(response)
}

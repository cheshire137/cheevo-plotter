package server

import (
	"encoding/json"
	"net/http"

	"github.com/cheshire137/cheevo-plotter/pkg/steam"
	"github.com/cheshire137/cheevo-plotter/pkg/util"
)

type SteamFriendsResponse struct {
	FriendIds []string `json:"friendIds"`
}

func (e *Env) GetSteamFriendsHandler(w http.ResponseWriter, r *http.Request) {
	util.LogRequest(r)
	e.enableCors(&w)

	steamId := r.URL.Query().Get("steamid")
	if len(steamId) < 1 {
		ErrorMessageJson(w, "steamid parameter is required", 400)
		return
	}

	client := steam.NewClient(e.config.SteamApiKey)
	friendIds, err := client.GetFriends(steamId)
	if err != nil {
		ErrorJson(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	response := SteamFriendsResponse{FriendIds: friendIds}
	json.NewEncoder(w).Encode(response)
}

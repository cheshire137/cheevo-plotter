package server

import (
	"encoding/json"
	"net/http"

	"github.com/cheshire137/cheevo-plotter/pkg/util"
)

type SteamFriendsResponse struct {
	FriendIds []string `json:"friendIds"`
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

	w.Header().Set("Content-Type", "application/json")
	response := SteamFriendsResponse{FriendIds: user.FriendIds}
	json.NewEncoder(w).Encode(response)
}

package server

import (
	"encoding/json"
	"net/http"

	"github.com/cheshire137/cheevo-plotter/pkg/steam"
	"github.com/cheshire137/cheevo-plotter/pkg/util"
)

func (e *Env) GetCurrentUserHandler(w http.ResponseWriter, r *http.Request) {
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

	if user == nil {
		ErrorMessageJson(w, "Steam user not found", http.StatusNotFound)
		return
	}

	if len(user.FriendIds) < 1 {
		client := steam.NewClient(e.config.SteamApiKey)
		friendIds, err := client.GetFriends(steamId)
		if err == nil {
			user.FriendIds = friendIds
			err = e.ds.UpsertSteamUser(user)
			if err != nil {
				util.LogError("Failed to update Steam user friends list: " + err.Error())
			}
		} else {
			user.FriendIds = []string{}
			util.LogError("Failed to look up Steam friend IDs: " + err.Error())
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

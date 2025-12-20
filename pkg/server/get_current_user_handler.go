package server

import (
	"encoding/json"
	"net/http"

	"github.com/cheshire137/cheevo-plotter/pkg/util"
)

type CurrentUserResponse struct {
	SteamId string `json:"steamId"`
}

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

	response := CurrentUserResponse{SteamId: user.Id}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

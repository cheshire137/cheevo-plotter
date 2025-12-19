package server

import (
	"encoding/json"
	"net/http"

	"github.com/cheshire137/cheevo-plotter/pkg/steam"
	"github.com/cheshire137/cheevo-plotter/pkg/util"
)

type SteamUserIdResponse struct {
	SteamId string `json:"steamId"`
}

func (e *Env) GetSteamUserIdHandler(w http.ResponseWriter, r *http.Request) {
	util.LogRequest(r)
	e.enableCors(&w)

	username := r.URL.Query().Get("username")
	if len(username) < 1 {
		ErrorMessageJson(w, "username parameter is required", 400)
		return
	}

	client := steam.NewClient(e.config.SteamApiKey)
	steamId, err := client.GetSteamId(username)
	if err != nil {
		ErrorJson(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	response := SteamUserIdResponse{SteamId: steamId}
	json.NewEncoder(w).Encode(response)
}

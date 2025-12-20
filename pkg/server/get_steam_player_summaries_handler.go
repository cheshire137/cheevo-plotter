package server

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/cheshire137/cheevo-plotter/pkg/data_store"
	"github.com/cheshire137/cheevo-plotter/pkg/steam"
	"github.com/cheshire137/cheevo-plotter/pkg/util"
)

type SteamPlayerSummariesResponse struct {
	Players []*data_store.SteamUser `json:"players"`
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

	w.Header().Set("Content-Type", "application/json")
	response := SteamPlayerSummariesResponse{Players: playerSummaries}
	json.NewEncoder(w).Encode(response)
}

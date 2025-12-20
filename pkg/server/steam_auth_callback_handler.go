package server

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"github.com/cheshire137/cheevo-plotter/pkg/data_store"
	"github.com/cheshire137/cheevo-plotter/pkg/util"
	"github.com/yohcop/openid-go"
)

func (e *Env) SteamAuthCallbackHandler(w http.ResponseWriter, r *http.Request) {
	util.LogRequest(r)

	fullURL := fmt.Sprintf("http://localhost:%d%s", e.config.BackendPort, r.URL.String())
	steamProfileUrl, err := openid.Verify(fullURL, e.discoveryCache, e.nonceStore)
	if err != nil {
		util.LogError("Failed to verify Steam auth: " + err.Error())
		http.Error(w, "Failed to verify Steam auth", http.StatusUnauthorized)
		return
	}

	u, err := url.Parse(steamProfileUrl)
	if err != nil {
		util.LogError("Failed to parse Steam profile URL: " + err.Error())
		http.Error(w, "Failed to parse Steam profile URL: "+steamProfileUrl, http.StatusInternalServerError)
		return
	}

	pathParts := strings.Split(u.Path, "/openid/id/")
	if len(pathParts) < 2 {
		util.LogError("Unexpected Steam profile URL path: " + u.Path)
		http.Error(w, "Unexpected Steam profile URL path: "+u.Path, http.StatusInternalServerError)
		return
	}

	steamId := pathParts[1]
	user, err := e.ds.GetSteamUser(steamId)
	if user == nil {
		user = &data_store.SteamUser{Id: steamId}
		err = e.ds.AddSteamUser(user)
		if err != nil {
			util.LogError("Failed to create new user: " + err.Error())
			http.Error(w, "Failed to create new user", http.StatusInternalServerError)
			return
		}
	}

	setSteamIdCookie(steamId, w)
	e.redirectToFrontend(w, r)
}

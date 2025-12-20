package server

import (
	"fmt"
	"net/http"

	"github.com/cheshire137/cheevo-plotter/pkg/util"
	"github.com/yohcop/openid-go"
)

func (e *Env) RedirectToSteamAuthHandler(w http.ResponseWriter, r *http.Request) {
	util.LogRequest(r)

	callbackUrl := fmt.Sprintf("http://localhost:%d/auth/steam/callback", e.config.BackendPort)
	realm := fmt.Sprintf("http://localhost:%d/", e.config.BackendPort)
	u, err := openid.RedirectURL("http://steamcommunity.com/openid", callbackUrl, realm)
	if err != nil {
		ErrorJson(w, err)
		return
	}

	http.Redirect(w, r, u, http.StatusSeeOther)
}

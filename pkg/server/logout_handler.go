package server

import (
	"net/http"

	"github.com/cheshire137/cheevo-plotter/pkg/util"
)

func (e *Env) LogoutHandler(w http.ResponseWriter, r *http.Request) {
	util.LogRequest(r)

	cookie := &http.Cookie{
		Name:     steamIdCookieName,
		Value:    "",
		Path:     "/",
		Domain:   "localhost",
		MaxAge:   -1, // Delete the cookie
		HttpOnly: true,
		Secure:   false, // Set to true in production with HTTPS
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(w, cookie)

	e.redirectToFrontend(w, r)
}

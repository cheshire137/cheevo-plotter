package server

import (
	"fmt"
	"net/http"
)

func (e *Env) OptionsHandler(w http.ResponseWriter, r *http.Request) {
	e.enableCors(&w)
}

func (e *Env) enableCors(w *http.ResponseWriter) {
	allowedUrl := fmt.Sprintf("http://localhost:%d", e.config.FrontendPort)
	(*w).Header().Set("Access-Control-Allow-Origin", allowedUrl)
	(*w).Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-CSRF-Token")
	(*w).Header().Set("Access-Control-Max-Age", "86400")
	(*w).Header().Set("Access-Control-Allow-Credentials", "true") // Allow cookies
}

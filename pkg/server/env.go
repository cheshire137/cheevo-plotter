package server

import (
	"fmt"
	"net/http"

	"github.com/cheshire137/cheevo-plotter/pkg/config"
	"github.com/cheshire137/cheevo-plotter/pkg/data_store"
)

type Env struct {
	ds     *data_store.DataStore
	config *config.Config
}

func NewEnv(ds *data_store.DataStore, config *config.Config) (*Env, error) {
	return &Env{ds: ds, config: config}, nil
}

func (e *Env) redirectToFrontend(w http.ResponseWriter, r *http.Request) {
	frontendUrl := fmt.Sprintf("http://localhost:%d", e.config.FrontendPort)
	http.Redirect(w, r, frontendUrl, http.StatusFound)
}

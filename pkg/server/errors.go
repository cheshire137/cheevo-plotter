package server

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/cheshire137/cheevo-plotter/pkg/steam"
	"github.com/cheshire137/cheevo-plotter/pkg/util"
)

type ErrorResponse struct {
	Error string `json:"error"`
}

func ErrorJson(w http.ResponseWriter, err error) {
	var statusCode int
	if errors.Is(err, sql.ErrNoRows) {
		statusCode = http.StatusNotFound
	} else if errors.Is(err, steam.ErrUnauthorized) {
		statusCode = http.StatusUnauthorized
	} else if errors.Is(err, steam.ErrForbidden) {
		statusCode = http.StatusForbidden
	} else {
		statusCode = http.StatusInternalServerError
	}
	ErrorMessageJson(w, err.Error(), statusCode)
}

func ErrorMessageJson(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	response := ErrorResponse{Error: message}
	util.LogError(fmt.Sprintf("%d: %s", statusCode, response.Error))
	json.NewEncoder(w).Encode(response)
}

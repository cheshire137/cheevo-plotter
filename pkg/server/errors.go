package server

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/cheshire137/cheevo-plotter/pkg/util"
)

type ErrorResponse struct {
	Error string `json:"error"`
}

func ErrorJson(w http.ResponseWriter, err error) {
	w.Header().Set("Content-Type", "application/json")
	var statusCode int
	if err == sql.ErrNoRows {
		statusCode = http.StatusNotFound
	} else {
		statusCode = http.StatusInternalServerError
	}
	w.WriteHeader(statusCode)
	response := ErrorResponse{Error: err.Error()}
	util.LogError(fmt.Sprintf("%d: %s", statusCode, response.Error))
	json.NewEncoder(w).Encode(response)
}

func ErrorMessageJson(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	response := ErrorResponse{Error: message}
	util.LogError(fmt.Sprintf("%d: %s", statusCode, response.Error))
	json.NewEncoder(w).Encode(response)
}

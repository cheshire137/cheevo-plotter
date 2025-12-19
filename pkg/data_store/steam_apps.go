package data_store

import (
	"errors"
	"fmt"
	"strings"
)

type SteamApp struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

func NewSteamApp(data map[string]interface{}) *SteamApp {
	result := &SteamApp{}
	if appid, ok := data["appid"].(float64); ok {
		result.Id = fmt.Sprintf("%.0f", appid)
	}
	if name, ok := data["name"].(string); ok {
		result.Name = name
	}
	return result
}

func (ds *DataStore) ListSteamApps() ([]*SteamApp, error) {
	apps := []*SteamApp{}
	query := `SELECT id, name FROM steam_apps ORDER BY name ASC, id ASC`
	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return apps, fmt.Errorf("failed to prepare query for listing Steam apps: %w", err)
	}

	rows, err := stmt.Query()
	if err != nil {
		return apps, fmt.Errorf("failed to query Steam apps: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		app := &SteamApp{}
		err := rows.Scan(&app.Id, &app.Name)
		if err != nil {
			return apps, fmt.Errorf("failed to scan Steam app row: %w", err)
		}
		apps = append(apps, app)
	}

	return apps, nil
}

func (ds *DataStore) AddSteamApp(app *SteamApp) error {
	if app == nil {
		return errors.New("app is required")
	}

	app.Name = strings.TrimSpace(app.Name)
	if len(app.Name) < 1 {
		return errors.New("app name is required")
	}

	app.Id = strings.TrimSpace(app.Id)
	if len(app.Id) < 1 {
		return errors.New("app ID is required")
	}

	query := `INSERT INTO steam_apps (id, name) VALUES (?, ?)
		ON CONFLICT (id) DO UPDATE SET name = excluded.name`
	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare query for inserting Steam app %w", err)
	}

	_, err = stmt.Exec(app.Id, app.Name)
	if err != nil {
		return fmt.Errorf("failed to insert Steam app: %w", err)
	}

	return nil
}

func (ds *DataStore) createSteamAppsTable() error {
	query := `CREATE TABLE IF NOT EXISTS steam_apps (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL
	);`

	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return err
	}

	_, err = stmt.Exec()
	return err
}

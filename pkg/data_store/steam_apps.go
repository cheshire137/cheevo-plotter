package data_store

import (
	"database/sql"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/cheshire137/cheevo-plotter/pkg/steam"
)

type SteamApp struct {
	Id              string `json:"id"`
	Name            string `json:"name"`
	HasAchievements bool   `json:"hasAchievements"`
}

func NewSteamApp(data *steam.SteamApp) *SteamApp {
	return &SteamApp{Id: data.Id, Name: data.Name, HasAchievements: true}
}

func (ds *DataStore) GetLastAppId() (int32, error) {
	query := `SELECT id FROM steam_apps ORDER BY id DESC LIMIT 1`
	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return 0, fmt.Errorf("failed to prepare query for getting last Steam app ID: %w", err)
	}
	defer stmt.Close()

	var appIdStr string
	err = stmt.QueryRow().Scan(&appIdStr)
	if err != nil {
		return 0, fmt.Errorf("failed to get last Steam app ID: %w", err)
	}

	appId64, err := strconv.ParseInt(appIdStr, 10, 32)
	if err != nil {
		return 0, fmt.Errorf("Error converting string to int32: %v", err)
	}
	return int32(appId64), nil
}

func (ds *DataStore) GetSteamApp(id string) (*SteamApp, error) {
	app := &SteamApp{}
	query := `SELECT id, name, has_achievements FROM steam_apps WHERE id = ?`
	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return nil, fmt.Errorf("failed to prepare query for getting Steam app: %v", err)
	}
	defer stmt.Close()

	err = stmt.QueryRow(id).Scan(&app.Id, &app.Name, &app.HasAchievements)
	if err != nil {
		return nil, fmt.Errorf("failed to get Steam app: %v", err)
	}

	return app, nil
}

func (ds *DataStore) ListSteamApps(lastAppId string, limit int32) ([]*SteamApp, error) {
	apps := []*SteamApp{}
	query := `SELECT id, name, has_achievements FROM steam_apps `
	if len(lastAppId) > 0 {
		query += `WHERE id > ? `
	}
	query += `ORDER BY name ASC, id ASC LIMIT ?`
	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return apps, fmt.Errorf("failed to prepare query for listing Steam apps: %w", err)
	}
	defer stmt.Close()

	var rows *sql.Rows
	if len(lastAppId) > 0 {
		rows, err = stmt.Query(lastAppId, limit)
	} else {
		rows, err = stmt.Query(limit)
	}
	if err != nil {
		return apps, fmt.Errorf("failed to query Steam apps: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		app := &SteamApp{}
		err := rows.Scan(&app.Id, &app.Name, &app.HasAchievements)
		if err != nil {
			return apps, fmt.Errorf("failed to scan Steam app row: %w", err)
		}
		apps = append(apps, app)
	}

	return apps, nil
}

func (ds *DataStore) GetSteamApps(appIds []string) ([]*SteamApp, error) {
	apps := []*SteamApp{}
	if len(appIds) < 1 {
		return apps, nil
	}

	placeholders := strings.Repeat("?,", len(appIds))
	placeholders = placeholders[:len(placeholders)-1] // drop trailing comma

	query := `SELECT id, name, has_achievements FROM steam_apps WHERE id IN (` + placeholders +
		`) ORDER BY name ASC, id ASC`
	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return apps, fmt.Errorf("failed to prepare query for getting Steam apps: %w", err)
	}
	defer stmt.Close()

	args := make([]interface{}, len(appIds))
	for i, appId := range appIds {
		args[i] = appId
	}

	rows, err := stmt.Query(args...)
	if err != nil {
		return apps, fmt.Errorf("failed to query Steam apps: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		app := &SteamApp{}
		err := rows.Scan(&app.Id, &app.Name, &app.HasAchievements)
		if err != nil {
			return apps, fmt.Errorf("failed to scan Steam app row: %w", err)
		}
		apps = append(apps, app)
	}

	return apps, nil
}

func (ds *DataStore) SetHasAchievements(appId string, hasAchievements bool) error {
	appId = strings.TrimSpace(appId)
	if len(appId) < 1 {
		return errors.New("app ID is required")
	}

	query := `UPDATE steam_apps SET has_achievements = ? WHERE id = ?`
	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare query for updating Steam app achievement status: %v", err)
	}
	defer stmt.Close()

	_, err = stmt.Exec(hasAchievements, appId)
	if err != nil {
		return fmt.Errorf("failed to update Steam app achievement status: %v", err)
	}

	return nil
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

	query := `INSERT INTO steam_apps (id, name, has_achievements) VALUES (?, ?, ?)
		ON CONFLICT (id) DO UPDATE SET name = excluded.name, has_achievements = excluded.has_achievements`
	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare query for inserting Steam app %w", err)
	}
	defer stmt.Close()

	_, err = stmt.Exec(app.Id, app.Name, app.HasAchievements)
	if err != nil {
		return fmt.Errorf("failed to insert Steam app: %w", err)
	}

	return nil
}

func (ds *DataStore) createSteamAppsTable() error {
	query := `CREATE TABLE IF NOT EXISTS steam_apps (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		has_achievements INTEGER NOT NULL DEFAULT 1
	);`

	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec()
	return err
}

package data_store

import (
	"database/sql"
	"errors"
	"fmt"
	"time"
)

const steamAppsId = "steam-apps"

func (ds *DataStore) GetSteamAppsSyncTime() (*time.Time, error) {
	return ds.getSyncTime(steamAppsId)
}

func (ds *DataStore) SetSteamAppsSyncTime(t time.Time) error {
	return ds.setSyncTime(steamAppsId, t)
}

func (ds *DataStore) getSyncTime(id string) (*time.Time, error) {
	query := `SELECT time FROM sync_times WHERE id = ?`
	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return nil, fmt.Errorf("failed to prepare query to get sync time: %w", err)
	}

	var timeStr string
	err = stmt.QueryRow(id).Scan(&timeStr)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to query row for getting sync time: %w", err)
	}

	parsedTime, err := time.Parse(time.RFC3339, timeStr)
	if err != nil {
		return nil, fmt.Errorf("failed to parse sync time: %w", err)
	}

	return &parsedTime, nil
}

func (ds *DataStore) setSyncTime(id string, t time.Time) error {
	query := `INSERT INTO sync_times (id, time) VALUES (?, ?)
		ON CONFLICT (id) DO UPDATE SET time = excluded.time`
	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare statement to set sync time: %w", err)
	}

	_, err = stmt.Exec(id, t.Format(time.RFC3339))
	if err != nil {
		return fmt.Errorf("failed to execute statement to set sync time: %w", err)
	}

	return nil
}

func (ds *DataStore) createSyncTimesTable() error {
	query := `CREATE TABLE IF NOT EXISTS sync_times (
		id TEXT PRIMARY KEY NOT NULL,
		time TEXT NOT NULL
	);`

	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return err
	}

	_, err = stmt.Exec()
	return err
}

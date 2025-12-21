package data_store

import (
	"database/sql"
	"fmt"
)

type DataStore struct {
	db *sql.DB
}

func NewDataStore(db *sql.DB) *DataStore {
	return &DataStore{db: db}
}

func (ds *DataStore) CreateTables() error {
	err := ds.createSteamAppsTable()
	if err != nil {
		return fmt.Errorf("failed to create Steam apps table: %w", err)
	}
	err = ds.createSyncTimesTable()
	if err != nil {
		return fmt.Errorf("failed to create sync times table: %w", err)
	}
	err = ds.createSteamUsersTable()
	if err != nil {
		return fmt.Errorf("failed to create Steam users table: %w", err)
	}
	err = ds.createSteamOwnedGamesTable()
	if err != nil {
		return fmt.Errorf("failed to create Steam owned games table: %w", err)
	}
	err = ds.createSteamPlayerAchievementsTable()
	if err != nil {
		return fmt.Errorf("failed to create Steam player achievements table: %w", err)
	}
	return ds.createSteamGameAchievementsTable()
}

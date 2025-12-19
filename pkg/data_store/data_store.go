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
	return ds.createSyncTimesTable()
}

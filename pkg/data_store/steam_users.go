package data_store

import (
	"errors"
	"fmt"
	"strings"
)

type SteamUser struct {
	Id string `json:"steamId"`
}

func (ds *DataStore) GetSteamUser(id string) (*SteamUser, error) {
	user := &SteamUser{}
	query := `SELECT id FROM steam_users WHERE id = ?`
	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return nil, fmt.Errorf("failed to prepare query for getting Steam user: %w", err)
	}

	err = stmt.QueryRow(id).Scan(&user.Id)
	if err != nil {
		return nil, fmt.Errorf("failed to get Steam user: %w", err)
	}

	return user, nil
}

func (ds *DataStore) AddSteamUser(user *SteamUser) error {
	if user == nil {
		return errors.New("user is required")
	}

	user.Id = strings.TrimSpace(user.Id)
	if len(user.Id) < 1 {
		return errors.New("user ID is required")
	}

	query := `INSERT INTO steam_users (id) VALUES (?)`
	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare query for inserting Steam user %w", err)
	}

	_, err = stmt.Exec(user.Id)
	if err != nil {
		return fmt.Errorf("failed to insert Steam user: %w", err)
	}

	return nil
}

func (ds *DataStore) createSteamUsersTable() error {
	query := `CREATE TABLE IF NOT EXISTS steam_users (
		id TEXT PRIMARY KEY
	);`

	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return err
	}

	_, err = stmt.Exec()
	return err
}

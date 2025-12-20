package data_store

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"
)

type SteamUser struct {
	Id         string `json:"steamId"`
	Name       string `json:"name"`
	AvatarUrl  string `json:"avatarUrl"`
	ProfileUrl string `json:"profileUrl"`
}

func (ds *DataStore) GetSteamUser(id string) (*SteamUser, error) {
	user := &SteamUser{}
	query := `SELECT id, name, avatar_url, profile_url FROM steam_users WHERE id = ?`
	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return nil, fmt.Errorf("failed to prepare query for getting Steam user: %w", err)
	}

	var name, avatarUrl, profileUrl sql.NullString
	err = stmt.QueryRow(id).Scan(&user.Id, &name, &avatarUrl, &profileUrl)
	if err != nil {
		return nil, fmt.Errorf("failed to get Steam user: %w", err)
	}

	if name.Valid {
		user.Name = name.String
	}
	if avatarUrl.Valid {
		user.AvatarUrl = avatarUrl.String
	}
	if profileUrl.Valid {
		user.ProfileUrl = profileUrl.String
	}

	return user, nil
}

func (ds *DataStore) UpsertSteamUser(user *SteamUser) error {
	if user == nil {
		return errors.New("user is required")
	}

	user.Id = strings.TrimSpace(user.Id)
	if len(user.Id) < 1 {
		return errors.New("user ID is required")
	}

	query := `INSERT INTO steam_users (id, name, avatar_url, profile_url) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO
		UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, profile_url=excluded.profile_url`
	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare query for inserting Steam user %w", err)
	}

	_, err = stmt.Exec(user.Id, user.Name, user.AvatarUrl, user.ProfileUrl)
	if err != nil {
		return fmt.Errorf("failed to insert Steam user: %w", err)
	}

	return nil
}

func (ds *DataStore) createSteamUsersTable() error {
	query := `CREATE TABLE IF NOT EXISTS steam_users (
		id TEXT PRIMARY KEY,
		name TEXT,
		avatar_url TEXT,
		profile_url TEXT
	);`

	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return err
	}

	_, err = stmt.Exec()
	return err
}

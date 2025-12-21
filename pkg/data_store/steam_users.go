package data_store

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"
)

type SteamUser struct {
	Id         string   `json:"steamId"`
	Name       string   `json:"name"`
	AvatarUrl  string   `json:"avatarUrl"`
	ProfileUrl string   `json:"profileUrl"`
	FriendIds  []string `json:"friendIds"`
}

const friendIdSeparator = ","

func (ds *DataStore) GetSteamUser(id string) (*SteamUser, error) {
	user := &SteamUser{}
	query := `SELECT id, name, avatar_url, profile_url, friend_ids FROM steam_users WHERE id = ?`
	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return nil, fmt.Errorf("failed to prepare query for getting Steam user: %w", err)
	}
	defer stmt.Close()

	var name, avatarUrl, profileUrl, friendIds sql.NullString
	err = stmt.QueryRow(id).Scan(&user.Id, &name, &avatarUrl, &profileUrl, &friendIds)
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
	if friendIds.Valid {
		user.FriendIds = strings.Split(friendIds.String, friendIdSeparator)
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

	query := `INSERT INTO steam_users (id, name, avatar_url, profile_url, friend_ids) VALUES (?, ?, ?, ?, ?)
		ON CONFLICT(id) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url,
			profile_url=excluded.profile_url, friend_ids=excluded.friend_ids`
	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare query for inserting Steam user %w", err)
	}
	defer stmt.Close()

	_, err = stmt.Exec(user.Id, user.Name, user.AvatarUrl, user.ProfileUrl,
		strings.Join(user.FriendIds, friendIdSeparator))
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
		profile_url TEXT,
		friend_ids TEXT
	);`

	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec()
	return err
}

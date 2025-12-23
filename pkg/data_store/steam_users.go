package data_store

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/cheshire137/cheevo-plotter/pkg/steam"
	"github.com/cheshire137/cheevo-plotter/pkg/util"
)

type SteamUser struct {
	Id             string   `json:"steamId"`
	Name           string   `json:"name"`
	AvatarUrl      string   `json:"avatarUrl"`
	ProfileUrl     string   `json:"profileUrl"`
	FriendIds      []string `json:"friendIds"`
	PrivateProfile bool     `json:"privateProfile"`
}

func NewSteamUser(data *steam.SteamPlayerSummary) *SteamUser {
	return &SteamUser{
		Id:             data.Id,
		Name:           data.Name,
		AvatarUrl:      data.AvatarUrl,
		ProfileUrl:     data.ProfileUrl,
		FriendIds:      []string{},
		PrivateProfile: false,
	}
}

const friendIdSeparator = ","

func (ds *DataStore) GetSteamUsers(ids []string) ([]*SteamUser, error) {
	users := []*SteamUser{}
	if len(ids) < 1 {
		return users, nil
	}

	placeholders := strings.Repeat("?,", len(ids))
	placeholders = placeholders[:len(placeholders)-1] // drop trailing comma

	query := `SELECT id, name, avatar_url, profile_url, friend_ids, private_profile
		FROM steam_users WHERE id IN (` + placeholders + `) ORDER BY name ASC`
	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return users, fmt.Errorf("failed to prepare query for listing Steam users: %v", err)
	}
	defer stmt.Close()

	args := make([]interface{}, len(ids))
	for i, id := range ids {
		args[i] = id
	}

	rows, err := stmt.Query(args...)
	if err != nil {
		return users, fmt.Errorf("failed to query Steam users: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		user := &SteamUser{}
		var name, avatarUrl, profileUrl, friendIds sql.NullString
		err := rows.Scan(&user.Id, &name, &avatarUrl, &profileUrl, &friendIds, &user.PrivateProfile)
		if err != nil {
			return users, fmt.Errorf("failed to scan Steam user row: %v", err)
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

		users = append(users, user)
	}

	return users, nil
}

func (ds *DataStore) GetSteamUser(id string) (*SteamUser, error) {
	user := &SteamUser{}
	query := `SELECT id, name, avatar_url, profile_url, friend_ids, private_profile FROM steam_users WHERE id = ?`
	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return nil, fmt.Errorf("failed to prepare query for getting Steam user: %v", err)
	}
	defer stmt.Close()

	var name, avatarUrl, profileUrl, friendIds sql.NullString
	err = stmt.QueryRow(id).Scan(&user.Id, &name, &avatarUrl, &profileUrl, &friendIds, &user.PrivateProfile)
	if err != nil {
		return nil, fmt.Errorf("failed to get Steam user: %v", err)
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

func (ds *DataStore) SetPrivateProfile(steamId string, privateProfile bool) error {
	steamId = strings.TrimSpace(steamId)
	if len(steamId) < 1 {
		return errors.New("user Steam ID is required")
	}

	query := `UPDATE steam_users SET private_profile = ? WHERE id = ?`
	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare query for updating Steam user private profile status: %v", err)
	}
	defer stmt.Close()

	_, err = stmt.Exec(privateProfile, steamId)
	if err != nil {
		return fmt.Errorf("failed to update Steam user private profile status: %v", err)
	}

	return nil
}

func (ds *DataStore) UpsertSteamUser(user *SteamUser) error {
	if user == nil {
		return errors.New("user is required")
	}

	user.Id = strings.TrimSpace(user.Id)
	if len(user.Id) < 1 {
		return errors.New("user ID is required")
	}

	util.LogInfo("Saving Steam user " + user.Name)
	query := `INSERT INTO steam_users (id, name, avatar_url, profile_url, friend_ids, private_profile)
		VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET
		name=excluded.name, avatar_url=excluded.avatar_url, profile_url=excluded.profile_url,
		friend_ids=excluded.friend_ids, private_profile=excluded.private_profile`
	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare query for inserting Steam user %v", err)
	}
	defer stmt.Close()

	_, err = stmt.Exec(user.Id, user.Name, user.AvatarUrl, user.ProfileUrl,
		strings.Join(user.FriendIds, friendIdSeparator), user.PrivateProfile)
	if err != nil {
		return fmt.Errorf("failed to insert Steam user: %v", err)
	}

	return nil
}

func (ds *DataStore) createSteamUsersTable() error {
	query := `CREATE TABLE IF NOT EXISTS steam_users (
		id TEXT PRIMARY KEY,
		name TEXT,
		avatar_url TEXT,
		profile_url TEXT,
		friend_ids TEXT,
		private_profile INTEGER NOT NULL DEFAULT 0
	);`

	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec()
	return err
}

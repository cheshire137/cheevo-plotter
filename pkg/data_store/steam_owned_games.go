package data_store

import (
	"errors"
	"fmt"
	"strings"

	"github.com/cheshire137/cheevo-plotter/pkg/steam"
)

type SteamOwnedGame struct {
	AppId    string `json:"appId"`
	Playtime int32  `json:"playtime"`
	SteamId  string `json:"steamId"`
}

func NewSteamOwnedGame(steamId string, data *steam.SteamOwnedGame) *SteamOwnedGame {
	return &SteamOwnedGame{AppId: data.AppId, Playtime: data.Playtime, SteamId: steamId}
}

func (ds *DataStore) GetSteamOwnedGames(steamId string) ([]*SteamOwnedGame, error) {
	apps := []*SteamOwnedGame{}
	query := `SELECT app_id, playtime, steam_id FROM steam_owned_games WHERE steam_id = ? ORDER BY app_id ASC`
	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return apps, fmt.Errorf("failed to prepare query for listing Steam apps: %w", err)
	}
	defer stmt.Close()

	rows, err := stmt.Query(steamId)
	if err != nil {
		return apps, fmt.Errorf("failed to query Steam owned games for %s: %w", steamId, err)
	}
	defer rows.Close()

	for rows.Next() {
		ownedGame := &SteamOwnedGame{}
		err := rows.Scan(&ownedGame.AppId, &ownedGame.Playtime, &ownedGame.SteamId)
		if err != nil {
			return apps, fmt.Errorf("failed to scan Steam owned game row: %w", err)
		}
		apps = append(apps, ownedGame)
	}

	return apps, nil
}

func (ds *DataStore) UpsertSteamOwnedGame(ownedGame *SteamOwnedGame) error {
	if ownedGame == nil {
		return errors.New("ownedGame is required")
	}

	ownedGame.AppId = strings.TrimSpace(ownedGame.AppId)
	if len(ownedGame.AppId) < 1 {
		return errors.New("app ID is required")
	}

	ownedGame.SteamId = strings.TrimSpace(ownedGame.SteamId)
	if len(ownedGame.SteamId) < 1 {
		return errors.New("app Steam ID for owner is required")
	}

	query := `INSERT INTO steam_owned_games (app_id, playtime, steam_id) VALUES (?, ?, ?)
		ON CONFLICT (app_id, steam_id) DO UPDATE SET playtime = excluded.playtime`
	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare query for inserting Steam owned game %w", err)
	}
	defer stmt.Close()

	_, err = stmt.Exec(ownedGame.AppId, ownedGame.Playtime, ownedGame.SteamId)
	if err != nil {
		return fmt.Errorf("failed to insert Steam owned game: %w", err)
	}

	return nil
}

func (ds *DataStore) createSteamOwnedGamesTable() error {
	query := `CREATE TABLE IF NOT EXISTS steam_owned_games (
		app_id TEXT NOT NULL,
		playtime INTEGER,
		steam_id TEXT NOT NULL,
		PRIMARY KEY (app_id, steam_id)
	);`

	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec()
	return err
}

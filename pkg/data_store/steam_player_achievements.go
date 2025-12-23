package data_store

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/cheshire137/cheevo-plotter/pkg/steam"
)

type SteamPlayerAchievement struct {
	Unlocked      bool   `json:"unlocked"`
	UnlockTimeStr string `json:"unlockTime"`
	Id            string `json:"id"`
	AppId         string `json:"app_id"`
	SteamId       string `json:"steamId"`
}

func NewSteamPlayerAchievement(steamId, appId string, data *steam.SteamPlayerAchievement) *SteamPlayerAchievement {
	return &SteamPlayerAchievement{SteamId: steamId, AppId: appId, Unlocked: data.Unlocked,
		UnlockTimeStr: data.UnlockTime, Id: data.Id}
}

func (p *SteamPlayerAchievement) UnlockTime() (*time.Time, error) {
	if len(p.UnlockTimeStr) < 1 {
		return nil, nil
	}
	unlockTime, err := time.Parse(time.RFC3339, p.UnlockTimeStr)
	return &unlockTime, err
}

func (ds *DataStore) GetSteamPlayerAchievements(steamId, appId string) ([]*SteamPlayerAchievement, error) {
	apps := []*SteamPlayerAchievement{}
	query := `SELECT unlocked, unlock_time, id
		FROM steam_player_achievements WHERE steam_id = ? AND app_id = ?
		ORDER BY unlocked DESC, unlock_time ASC, id ASC`
	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return apps, fmt.Errorf("failed to prepare query for listing Steam player achievements: %w", err)
	}
	defer stmt.Close()

	rows, err := stmt.Query(steamId, appId)
	if err != nil {
		return apps, fmt.Errorf("failed to query Steam player achievements: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		achievement := &SteamPlayerAchievement{}
		var unlockTimeStr sql.NullString
		err := rows.Scan(&achievement.Unlocked, &unlockTimeStr, &achievement.Id)
		if err != nil {
			return apps, fmt.Errorf("failed to scan Steam player achievement row: %w", err)
		}

		achievement.SteamId = steamId
		achievement.AppId = appId
		if unlockTimeStr.Valid {
			achievement.UnlockTimeStr = unlockTimeStr.String
		}

		apps = append(apps, achievement)
	}

	return apps, nil
}

func (ds *DataStore) UpsertSteamPlayerAchievement(achievement *SteamPlayerAchievement) error {
	if achievement == nil {
		return errors.New("achievement is required")
	}

	achievement.Id = strings.TrimSpace(achievement.Id)
	if len(achievement.Id) < 1 {
		return errors.New("achievement ID is required")
	}

	achievement.SteamId = strings.TrimSpace(achievement.SteamId)
	if len(achievement.SteamId) < 1 {
		return errors.New("achievement user Steam ID is required")
	}

	achievement.AppId = strings.TrimSpace(achievement.AppId)
	if len(achievement.AppId) < 1 {
		return errors.New("achievement app ID is required")
	}

	query := `INSERT INTO steam_player_achievements (id, unlocked, unlock_time, steam_id, app_id) VALUES (?, ?, ?, ?, ?)
		ON CONFLICT (id, steam_id, app_id) DO UPDATE SET unlocked = excluded.unlocked, unlock_time = excluded.unlock_time`
	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare query for inserting Steam player achievement %w", err)
	}
	defer stmt.Close()

	_, err = stmt.Exec(achievement.Id, achievement.Unlocked, achievement.UnlockTimeStr, achievement.SteamId,
		achievement.AppId)
	if err != nil {
		return fmt.Errorf("failed to insert Steam player achievement: %w", err)
	}

	return nil
}

func (ds *DataStore) createSteamPlayerAchievementsTable() error {
	query := `CREATE TABLE IF NOT EXISTS steam_player_achievements (
		id TEXT NOT NULL,
		unlocked INTEGER NOT NULL DEFAULT 0,
		unlock_time TEXT,
		steam_id TEXT NOT NULL,
		app_id TEXT NOT NULL,
		PRIMARY KEY (id, steam_id, app_id)
	);`

	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec()
	return err
}

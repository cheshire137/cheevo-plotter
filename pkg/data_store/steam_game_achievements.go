package data_store

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/cheshire137/cheevo-plotter/pkg/steam"
)

type SteamGameAchievement struct {
	Id          string `json:"id"`
	AppId       string `json:"appId"`
	Name        string `json:"name"`
	IconUrl     string `json:"iconUrl"`
	GrayIconUrl string `json:"grayIconUrl"`
	Description string `json:"description"`
	Hidden      bool   `json:"hidden"`
}

func NewSteamGameAchievement(appId string, data *steam.SteamGameAchievement) *SteamGameAchievement {
	return &SteamGameAchievement{
		Id:          data.Id,
		AppId:       appId,
		Name:        data.Name,
		IconUrl:     data.IconUrl,
		GrayIconUrl: data.GrayIconUrl,
		Description: data.Description,
		Hidden:      data.Hidden,
	}
}

func (ds *DataStore) GetSteamGameAchievements(appId string) ([]*SteamGameAchievement, error) {
	apps := []*SteamGameAchievement{}
	query := `SELECT id, app_id, name, icon_url, gray_icon_url, description, hidden
		FROM steam_game_achievements WHERE app_id = ? ORDER BY name ASC, id ASC`
	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return apps, fmt.Errorf("failed to prepare query for listing Steam game achievements: %w", err)
	}
	defer stmt.Close()

	rows, err := stmt.Query(appId)
	if err != nil {
		return apps, fmt.Errorf("failed to query Steam game achievements: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		achievement := &SteamGameAchievement{}
		var description, iconUrl, grayIconUrl sql.NullString
		err := rows.Scan(&achievement.Id, &achievement.AppId, &achievement.Name, &iconUrl,
			&grayIconUrl, &description, &achievement.Hidden)
		if err != nil {
			return apps, fmt.Errorf("failed to scan Steam game achievement row: %w", err)
		}

		if description.Valid {
			achievement.Description = description.String
		}
		if iconUrl.Valid {
			achievement.IconUrl = iconUrl.String
		}
		if grayIconUrl.Valid {
			achievement.GrayIconUrl = grayIconUrl.String
		}

		apps = append(apps, achievement)
	}

	return apps, nil
}

func (ds *DataStore) UpsertSteamGameAchievement(achievement *SteamGameAchievement) error {
	if achievement == nil {
		return errors.New("game achievement is required")
	}

	achievement.Id = strings.TrimSpace(achievement.Id)
	if len(achievement.Id) < 1 {
		return errors.New("game achievement ID is required")
	}

	achievement.Name = strings.TrimSpace(achievement.Name)
	if len(achievement.Name) < 1 {
		return errors.New("game achievement name is required")
	}

	achievement.AppId = strings.TrimSpace(achievement.AppId)
	if len(achievement.AppId) < 1 {
		return errors.New("game achievement app ID is required")
	}

	query := `INSERT INTO steam_game_achievements (id, app_id, name, icon_url, gray_icon_url, description, hidden)
		VALUES (?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT (id, app_id) DO UPDATE SET name = excluded.name, icon_url = excluded.icon_url,
			gray_icon_url = excluded.gray_icon_url, description = excluded.description, hidden = excluded.hidden`
	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare query for inserting Steam game achievement %w", err)
	}
	defer stmt.Close()

	_, err = stmt.Exec(achievement.Id, achievement.AppId, achievement.Name, achievement.IconUrl,
		achievement.GrayIconUrl, achievement.Description, achievement.Hidden)
	if err != nil {
		return fmt.Errorf("failed to insert Steam game achievement: %w", err)
	}

	return nil
}

func (ds *DataStore) createSteamGameAchievementsTable() error {
	query := `CREATE TABLE IF NOT EXISTS steam_game_achievements (
		id TEXT NOT NULL,
		app_id TEXT NOT NULL,
		name TEXT NOT NULL,
		description TEXT,
		icon_url TEXT,
		gray_icon_url TEXT,
		hidden BOOLEAN NOT NULL,
		PRIMARY KEY (id, app_id)
	);`

	stmt, err := ds.db.Prepare(query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec()
	return err
}

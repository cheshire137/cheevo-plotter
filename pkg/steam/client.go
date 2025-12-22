package steam

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"sort"
	"strings"
	"time"

	"github.com/cheshire137/cheevo-plotter/pkg/util"
)

const baseApiUrl = "https://api.steampowered.com"

var ErrUnauthorized = errors.New("unauthorized")
var ErrForbidden = errors.New("forbidden")
var ErrBadRequest = errors.New("bad request")

type Client struct {
	apiKey string
}

type SteamOwnedGame struct {
	AppId    string `json:"appId"`
	Playtime int32  `json:"playtime"`
}

type SteamPlayerAchievement struct {
	Unlocked   bool   `json:"unlocked"`
	UnlockTime string `json:"unlockTime"`
	Id         string `json:"id"`
}

type SteamGameSchema struct {
	Name         string                  `json:"name"`
	Achievements []*SteamGameAchievement `json:"achievements"`
	Version      string                  `json:"version"`
}

type SteamGameAchievement struct {
	Id          string `json:"id"`
	Name        string `json:"name"`
	IconUrl     string `json:"iconUrl"`
	GrayIconUrl string `json:"grayIconUrl"`
	Description string `json:"description"`
	Hidden      bool   `json:"hidden"`
}

type SteamPlayerSummary struct {
	Id         string `json:"steamId"`
	Name       string `json:"name"`
	AvatarUrl  string `json:"avatarUrl"`
	ProfileUrl string `json:"profileUrl"`
}

type SteamApp struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

func NewClient(apiKey string) *Client {
	return &Client{apiKey: apiKey}
}

func (c *Client) GetGameSchema(appId string) (*SteamGameSchema, error) {
	// https://partner.steamgames.com/doc/webapi/ISteamUserStats#GetSchemaForGame
	u, err := url.Parse(baseApiUrl + "/ISteamUserStats/GetSchemaForGame/v2/")
	if err != nil {
		return nil, err
	}

	params := u.Query()
	params.Add("key", c.apiKey)
	params.Add("appid", appId)
	u.RawQuery = params.Encode()

	makeRequest := func() (*http.Response, error) {
		req, err := http.NewRequest("GET", u.String(), nil)
		if err != nil {
			return nil, err
		}

		util.LogRequest(req)
		return http.DefaultClient.Do(req)
	}

	data, err := c.makeJsonRequest(makeRequest, "get Steam game schema")
	if err != nil {
		return nil, err
	}

	achievements := []*SteamGameAchievement{}
	schema := &SteamGameSchema{}

	if gameMap, ok := data["game"].(map[string]interface{}); ok {
		if gameName, ok := gameMap["gameName"].(string); ok {
			schema.Name = gameName
		}

		if gameVersion, ok := gameMap["gameVersion"].(string); ok {
			schema.Version = gameVersion
		}

		if availableGameStats, ok := gameMap["availableGameStats"].(map[string]interface{}); ok {
			if achievementsData, ok := availableGameStats["achievements"].([]interface{}); ok {
				for _, achievementData := range achievementsData {
					if achievementMap, ok := achievementData.(map[string]interface{}); ok {
						achievement := &SteamGameAchievement{}

						if description, ok := achievementMap["description"].(string); ok {
							achievement.Description = description
						}

						if icon, ok := achievementMap["icon"].(string); ok {
							achievement.IconUrl = icon
						}

						if icongray, ok := achievementMap["icongray"].(string); ok {
							achievement.GrayIconUrl = icongray
						}

						if id, ok := achievementMap["name"].(string); ok {
							achievement.Id = id
						}

						if name, ok := achievementMap["displayName"].(string); ok {
							achievement.Name = name
						}

						if hidden, ok := achievementMap["hidden"].(float64); ok {
							achievement.Hidden = hidden == float64(1)
						}

						achievements = append(achievements, achievement)
					}
				}
			}
		}
	}

	schema.Achievements = achievements

	return schema, nil
}

func (c *Client) GetAchievements(steamId string, appId string) ([]*SteamPlayerAchievement, error) {
	// https://partner.steamgames.com/doc/webapi/ISteamUserStats#GetPlayerAchievements
	u, err := url.Parse(baseApiUrl + "/ISteamUserStats/GetPlayerAchievements/v1/")
	if err != nil {
		return nil, err
	}

	params := u.Query()
	params.Add("key", c.apiKey)
	params.Add("steamid", steamId)
	params.Add("appid", appId)
	u.RawQuery = params.Encode()

	makeRequest := func() (*http.Response, error) {
		req, err := http.NewRequest("GET", u.String(), nil)
		if err != nil {
			return nil, err
		}

		util.LogRequest(req)
		return http.DefaultClient.Do(req)
	}

	achievements := []*SteamPlayerAchievement{}
	data, err := c.makeJsonRequest(makeRequest, "get Steam achievements")
	if err != nil {
		// Game does not have achievements
		if errors.Is(err, ErrBadRequest) {
			return achievements, nil
		}

		return nil, err
	}

	if playerStats, ok := data["playerstats"].(map[string]interface{}); ok {
		if achievementsData, ok := playerStats["achievements"].([]interface{}); ok {
			for _, achievementData := range achievementsData {
				if achievementMap, ok := achievementData.(map[string]interface{}); ok {
					achievement := &SteamPlayerAchievement{}
					if id, ok := achievementMap["apiname"].(string); ok {
						achievement.Id = id
					}
					if achieved, ok := achievementMap["achieved"].(float64); ok {
						achievement.Unlocked = achieved == float64(1)
					}
					if unlockTimestamp, ok := achievementMap["unlocktime"].(float64); ok && achievement.Unlocked {
						unlockTime := time.Unix(int64(unlockTimestamp), 0)
						achievement.UnlockTime = unlockTime.Format(time.RFC3339)
					}
					achievements = append(achievements, achievement)
				}
			}
		}
	}

	sort.Slice(achievements, func(i, j int) bool {
		a1 := achievements[i]
		a2 := achievements[j]
		if a1.Unlocked && a2.Unlocked {
			if a1.UnlockTime == a2.UnlockTime {
				if a1.Id < a2.Id {
					return true
				}
				return false
			}
			if a1.UnlockTime < a2.UnlockTime {
				return true
			}
			return false
		}
		if a1.Unlocked && !a2.Unlocked {
			return true
		}
		if a2.Unlocked && !a1.Unlocked {
			return false
		}
		if a1.Id < a2.Id {
			return true
		}
		return false
	})

	return achievements, nil
}

func (c *Client) GetOwnedGames(steamId string) ([]*SteamOwnedGame, error) {
	// https://developer.valvesoftware.com/wiki/Steam_Web_API#GetOwnedGames_(v0001)
	u, err := url.Parse(baseApiUrl + "/IPlayerService/GetOwnedGames/v0001/")
	if err != nil {
		return nil, err
	}

	params := u.Query()
	params.Add("key", c.apiKey)
	params.Add("steamid", steamId)
	params.Add("format", "json")
	u.RawQuery = params.Encode()

	makeRequest := func() (*http.Response, error) {
		req, err := http.NewRequest("GET", u.String(), nil)
		if err != nil {
			return nil, err
		}

		util.LogRequest(req)
		return http.DefaultClient.Do(req)
	}

	data, err := c.makeJsonRequest(makeRequest, "get Steam owned games")
	if err != nil {
		return nil, err
	}

	result := []*SteamOwnedGame{}

	if response, ok := data["response"].(map[string]interface{}); ok {
		if games, ok := response["games"].([]interface{}); ok {
			for _, game := range games {
				if gameData, ok := game.(map[string]interface{}); ok {
					ownedGame := &SteamOwnedGame{}
					if appId, ok := gameData["appid"].(float64); ok {
						ownedGame.AppId = fmt.Sprintf("%.0f", appId)
					}
					if playTime, ok := gameData["playtime_forever"].(float64); ok {
						ownedGame.Playtime = int32(playTime)
					}
					if len(ownedGame.AppId) > 0 {
						result = append(result, ownedGame)
					}
				}
			}
		}
	}

	return result, err
}

func (c *Client) GetFriends(steamId string) ([]string, error) {
	// https://developer.valvesoftware.com/wiki/Steam_Web_API#GetFriendList_.28v0001.29
	u, err := url.Parse(baseApiUrl + "/ISteamUser/GetFriendList/v0001/")
	if err != nil {
		return nil, err
	}

	params := u.Query()
	params.Add("key", c.apiKey)
	params.Add("steamid", steamId)
	params.Add("format", "json")
	params.Add("relationship", "friend")
	u.RawQuery = params.Encode()

	makeRequest := func() (*http.Response, error) {
		req, err := http.NewRequest("GET", u.String(), nil)
		if err != nil {
			return nil, err
		}

		util.LogRequest(req)
		return http.DefaultClient.Do(req)
	}

	data, err := c.makeJsonRequest(makeRequest, "get Steam friends")
	if err != nil {
		return nil, err
	}

	friendSteamIds := []string{}

	if friendsList, ok := data["friendslist"].(map[string]interface{}); ok {
		if friends, ok := friendsList["friends"].([]interface{}); ok {
			for _, friend := range friends {
				if friendData, ok := friend.(map[string]interface{}); ok {
					if friendSteamId, ok := friendData["steamid"].(string); ok {
						friendSteamIds = append(friendSteamIds, friendSteamId)
					}
				}
			}
		}
	}

	return friendSteamIds, nil
}

func (c *Client) GetSteamId(username string) (string, error) {
	// https://wiki.teamfortress.com/wiki/WebAPI/ResolveVanityURL
	u, err := url.Parse(baseApiUrl + "/ISteamUser/ResolveVanityURL/v0001/")
	if err != nil {
		return "", err
	}

	params := u.Query()
	params.Add("key", c.apiKey)
	params.Add("vanityurl", username)
	u.RawQuery = params.Encode()

	makeRequest := func() (*http.Response, error) {
		req, err := http.NewRequest("GET", u.String(), nil)
		if err != nil {
			return nil, err
		}

		util.LogRequest(req)
		return http.DefaultClient.Do(req)
	}

	data, err := c.makeJsonRequest(makeRequest, "get Steam user ID")
	if err != nil {
		return "", err
	}

	if response, ok := data["response"].(map[string]interface{}); ok {
		if steamId, ok := response["steamid"].(string); ok {
			return steamId, nil
		}
	}

	return "", errors.New("could not find steam ID in response")
}

func (c *Client) GetPlayerSummary(steamId string) (*SteamPlayerSummary, error) {
	players, err := c.GetPlayerSummaries([]string{steamId})
	if err != nil {
		return nil, err
	}
	if len(players) != 1 {
		return nil, errors.New("could not find Steam user " + steamId)
	}
	return players[0], nil
}

func (c *Client) GetPlayerSummaries(steamIds []string) ([]*SteamPlayerSummary, error) {
	if len(steamIds) < 1 {
		return nil, errors.New("at least one Steam player ID must be given")
	}

	if len(steamIds) > 100 {
		return nil, errors.New("no more than 100 Steam player summaries can be loaded at a time")
	}

	// https://developer.valvesoftware.com/wiki/Steam_Web_API#GetPlayerSummaries_.28v0002.29
	u, err := url.Parse(baseApiUrl + "/ISteamUser/GetPlayerSummaries/v0002/")
	if err != nil {
		return nil, err
	}

	params := u.Query()
	params.Add("key", c.apiKey)
	params.Add("format", "json")
	params.Add("steamids", strings.Join(steamIds, ","))
	u.RawQuery = params.Encode()

	makeRequest := func() (*http.Response, error) {
		req, err := http.NewRequest("GET", u.String(), nil)
		if err != nil {
			return nil, err
		}

		util.LogRequest(req)
		return http.DefaultClient.Do(req)
	}

	data, err := c.makeJsonRequest(makeRequest, "get Steam apps")
	if err != nil {
		return nil, err
	}

	result := []*SteamPlayerSummary{}

	if response, ok := data["response"].(map[string]interface{}); ok {
		if players, ok := response["players"].([]interface{}); ok {
			for _, playerData := range players {
				if player, ok := playerData.(map[string]interface{}); ok {
					playerSummary := &SteamPlayerSummary{}
					if avatarUrl, ok := player["avatarmedium"].(string); ok {
						playerSummary.AvatarUrl = avatarUrl
					} else if avatarUrl, ok := player["avatarfull"].(string); ok {
						playerSummary.AvatarUrl = avatarUrl
					} else if avatarUrl, ok := player["avatar"].(string); ok {
						playerSummary.AvatarUrl = avatarUrl
					}
					if profileUrl, ok := player["profileurl"].(string); ok {
						playerSummary.ProfileUrl = profileUrl
					}
					if steamId, ok := player["steamid"].(string); ok {
						playerSummary.Id = steamId
					}
					if name, ok := player["personaname"].(string); ok {
						playerSummary.Name = name
					} else if name, ok := player["realname"].(string); ok {
						playerSummary.Name = name
					}
					result = append(result, playerSummary)
				}
			}
		}
	}

	return result, nil
}

func (c *Client) GetAppList(lastAppId int32) ([]*SteamApp, error) {
	result := []*SteamApp{}
	page, err := c.GetAppListPage(lastAppId)
	if err != nil {
		return result, err
	}

	result = append(result, page.apps...)
	lastAppId = int32(page.lastAppId)
	haveMoreResults := page.haveMoreResults

	for haveMoreResults {
		nextPage, err := c.GetAppListPage(lastAppId)
		if err != nil {
			return result, err
		}

		result = append(result, nextPage.apps...)
		lastAppId = int32(nextPage.lastAppId)
		haveMoreResults = nextPage.haveMoreResults
	}

	return result, nil
}

type AppListPage struct {
	apps            []*SteamApp
	lastAppId       float64
	haveMoreResults bool
}

func (c *Client) GetAppListPage(lastAppId int32) (*AppListPage, error) {
	// https://partner.steamgames.com/doc/webapi/IStoreService#GetAppList
	u, err := url.Parse(baseApiUrl + "/IStoreService/GetAppList/v1/")
	if err != nil {
		return nil, err
	}

	params := u.Query()
	params.Add("key", c.apiKey)
	params.Add("format", "json")
	params.Add("include_games", "true")
	params.Add("include_dlc", "false")
	params.Add("include_software", "false")
	params.Add("include_videos", "false")
	params.Add("include_hardware", "false")
	if lastAppId > 0 {
		params.Add("last_appid", fmt.Sprintf("%d", lastAppId))
	}
	u.RawQuery = params.Encode()

	makeRequest := func() (*http.Response, error) {
		req, err := http.NewRequest("GET", u.String(), nil)
		if err != nil {
			return nil, err
		}

		util.LogRequest(req)
		return http.DefaultClient.Do(req)
	}

	data, err := c.makeJsonRequest(makeRequest, "get Steam apps")
	if err != nil {
		return nil, err
	}

	appListPage := &AppListPage{}

	if response, ok := data["response"].(map[string]interface{}); ok {
		apps := []*SteamApp{}
		if appsInPage, ok := response["apps"].([]interface{}); ok {
			for _, appData := range appsInPage {
				if appDataMap, ok := appData.(map[string]interface{}); ok {
					app := &SteamApp{}
					if appid, ok := appDataMap["appid"].(float64); ok {
						app.Id = fmt.Sprintf("%.0f", appid)
					}
					if name, ok := appDataMap["name"].(string); ok {
						app.Name = name
					}
					if len(app.Name) > 0 {
						apps = append(apps, app)
					}
				}
			}
		}
		appListPage.apps = apps

		if lastAppId, ok := response["last_appid"].(float64); ok {
			appListPage.lastAppId = lastAppId
		}

		if haveMoreResults, ok := response["have_more_results"].(bool); ok {
			appListPage.haveMoreResults = haveMoreResults
		}
	}

	return appListPage, nil
}

func (c *Client) makeJsonRequest(makeRequest func() (*http.Response, error), action string) (map[string]interface{}, error) {
	resp, err := makeRequest()
	if err != nil {
		return nil, fmt.Errorf("failed to %s: %w", action, err)
	}
	defer resp.Body.Close()

	data, err := c.handleJsonResponse(action, resp)
	if err != nil {
		return nil, err
	}

	return data, nil
}

func (c *Client) handleJsonResponse(action string, resp *http.Response) (map[string]interface{}, error) {
	if resp.StatusCode >= 400 {
		return nil, handleHttpError(action, resp)
	}

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	var data map[string]interface{}
	if err := json.Unmarshal(bodyBytes, &data); err != nil {
		return nil, fmt.Errorf("failed to parse JSON response: %w", err)
	}

	return data, nil
}

func handleHttpError(action string, resp *http.Response) error {
	code := resp.StatusCode

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to %s (%d): could not read response body", action, code)
	}

	var jsonResp map[string]interface{}
	if err := json.Unmarshal(bodyBytes, &jsonResp); err != nil {
		return fmt.Errorf("failed to parse JSON error response and %s (%d):\n%s", action, code, string(bodyBytes))
	}

	util.InspectMap(jsonResp, "")
	if code == 401 {
		return ErrUnauthorized
	}
	if code == 403 {
		return ErrForbidden
	}
	if code == 400 {
		return ErrBadRequest
	}
	return fmt.Errorf("failed to %s (%d):\n%s", action, code, string(bodyBytes))
}

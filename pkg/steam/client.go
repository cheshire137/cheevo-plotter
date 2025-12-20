package steam

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/cheshire137/cheevo-plotter/pkg/data_store"
	"github.com/cheshire137/cheevo-plotter/pkg/util"
)

const baseApiUrl = "https://api.steampowered.com"

type Client struct {
	apiKey string
}

type SteamOwnedGame struct {
	AppId    string `json:"appId"`
	Playtime int32  `json:"playtime"`
}

func NewClient(apiKey string) *Client {
	return &Client{apiKey: apiKey}
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
	util.InspectMap(data, "")

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

func (c *Client) GetPlayerSummary(steamId string) (*data_store.SteamUser, error) {
	players, err := c.GetPlayerSummaries([]string{steamId})
	if err != nil {
		return nil, err
	}
	if len(players) != 1 {
		return nil, errors.New("could not find Steam user " + steamId)
	}
	return players[0], nil
}

func (c *Client) GetPlayerSummaries(steamIds []string) ([]*data_store.SteamUser, error) {
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

	result := []*data_store.SteamUser{}

	if response, ok := data["response"].(map[string]interface{}); ok {
		if players, ok := response["players"].([]interface{}); ok {
			for _, playerData := range players {
				if player, ok := playerData.(map[string]interface{}); ok {
					user := &data_store.SteamUser{}
					if avatarUrl, ok := player["avatarmedium"].(string); ok {
						user.AvatarUrl = avatarUrl
					} else if avatarUrl, ok := player["avatarfull"].(string); ok {
						user.AvatarUrl = avatarUrl
					} else if avatarUrl, ok := player["avatar"].(string); ok {
						user.AvatarUrl = avatarUrl
					}
					if profileUrl, ok := player["profileurl"].(string); ok {
						user.ProfileUrl = profileUrl
					}
					if steamId, ok := player["steamid"].(string); ok {
						user.Id = steamId
					}
					if name, ok := player["personaname"].(string); ok {
						user.Name = name
					} else if name, ok := player["realname"].(string); ok {
						user.Name = name
					}
					result = append(result, user)
				}
			}
		}
	}

	return result, nil
}

func (c *Client) GetAppList() ([]*data_store.SteamApp, error) {
	result := []*data_store.SteamApp{}
	page, err := c.GetAppListPage(0)
	if err != nil {
		return result, err
	}

	result = append(result, page.apps...)
	lastAppId := int32(page.lastAppId)
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
	apps            []*data_store.SteamApp
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
		apps := []*data_store.SteamApp{}
		if appsInPage, ok := response["apps"].([]interface{}); ok {
			for _, appData := range appsInPage {
				if appDataMap, ok := appData.(map[string]interface{}); ok {
					app := data_store.NewSteamApp(appDataMap)
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
		return fmt.Errorf("failed to %s (%d):\n%s", action, code, string(bodyBytes))
	}

	return fmt.Errorf("failed to %s (%d):\n%s", action, code, string(bodyBytes))
}

package steam

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"

	"github.com/cheshire137/cheevo-plotter/pkg/data_store"
	"github.com/cheshire137/cheevo-plotter/pkg/util"
)

const baseApiUrl = "https://api.steampowered.com"

type Client struct {
	apiKey string
}

func NewClient(apiKey string) *Client {
	return &Client{apiKey: apiKey}
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

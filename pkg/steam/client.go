package steam

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/cheshire137/cheevo-plotter/pkg/util"
)

const baseApiUrl = "http://api.steampowered.com"

type Client struct {
}

func NewClient() *Client {
	return &Client{}
}

func (c *Client) GetAppList() (map[string]interface{}, error) {
	url := baseApiUrl + "/ISteamApps/GetAppList/v2"

	makeRequest := func() (*http.Response, error) {
		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			return nil, err
		}

		return http.DefaultClient.Do(req)
	}

	data, err := c.makeJsonRequest(makeRequest, "get Steam apps")
	if err != nil {
		return nil, err
	}
	util.InspectMap(data, "")
	return data, nil
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

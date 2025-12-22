package server

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/cheshire137/cheevo-plotter/pkg/config"
	"github.com/cheshire137/cheevo-plotter/pkg/data_store"
	"github.com/cheshire137/cheevo-plotter/pkg/steam"
	"github.com/cheshire137/cheevo-plotter/pkg/util"
	"github.com/yohcop/openid-go"
)

type Env struct {
	ds             *data_store.DataStore
	config         *config.Config
	nonceStore     *openid.SimpleNonceStore
	discoveryCache openid.DiscoveryCache
}

func NewEnv(ds *data_store.DataStore, config *config.Config) (*Env, error) {
	nonceStore := openid.NewSimpleNonceStore()
	discoveryCache := &NoopDiscoveryCache{}
	return &Env{ds: ds, config: config, nonceStore: nonceStore, discoveryCache: discoveryCache}, nil
}

func (e *Env) SyncSteamAppsIfNecessary() error {
	lastSynced, err := e.ds.GetSteamAppsSyncTime()
	if err != nil {
		return fmt.Errorf("failed to get Steam apps sync time: %w", err)
	}

	if lastSynced == nil || time.Since(*lastSynced) > 24*time.Hour {
		lastAppId, err := e.ds.GetLastAppId()
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return fmt.Errorf("failed to get last Steam app ID: %w", err)
		}

		if lastAppId > 0 {
			util.LogInfo(fmt.Sprintf("fetching Steam apps starting with app ID %d", lastAppId))
		} else {
			util.LogInfo("fetching all Steam apps")
		}
		client := steam.NewClient(e.config.SteamApiKey)

		apps, err := client.GetAppList(lastAppId)
		if err != nil {
			return fmt.Errorf("failed to load all Steam apps: %w", err)
		}

		allItemsSaved := len(apps) > 0
		for _, app := range apps {
			err := e.ds.AddSteamApp(data_store.NewSteamApp(app))
			if err != nil {
				allItemsSaved = false
				util.LogError("Failed to save Steam app " + app.Id + ": " + err.Error())
			}
		}

		if allItemsSaved {
			err = e.ds.SetSteamAppsSyncTime(time.Now())
			if err != nil {
				return fmt.Errorf("failed to set Steam apps sync time: %w", err)
			}
		}
	} else {
		util.LogInfo("Loading Steam apps from database, last synced " + lastSynced.String())
	}

	return nil
}

func (e *Env) redirectToFrontend(w http.ResponseWriter, r *http.Request) {
	frontendUrl := fmt.Sprintf("http://localhost:%d", e.config.FrontendPort)
	http.Redirect(w, r, frontendUrl, http.StatusFound)
}

const steamIdCookieName = "steamId"

func setSteamIdCookie(steamId string, w http.ResponseWriter) {
	cookie := &http.Cookie{
		Name:     steamIdCookieName,
		Value:    steamId,
		Path:     "/",
		Domain:   "localhost",
		MaxAge:   86400 * 7, // 7 days
		HttpOnly: true,
		Secure:   false, // Set to true in production with HTTPS
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(w, cookie)
}

func (e *Env) getCurrentSteamId(r *http.Request) (string, error) {
	cookie, err := r.Cookie(steamIdCookieName)
	if err != nil {
		return "", err
	}

	steamId := cookie.Value
	if steamId == "" {
		return "", errors.New("invalid Steam ID in cookie")
	}

	return steamId, nil
}

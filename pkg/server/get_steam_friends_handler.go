package server

import (
	"encoding/json"
	"net/http"
	"sort"
	"strings"

	"github.com/cheshire137/cheevo-plotter/pkg/data_store"
	"github.com/cheshire137/cheevo-plotter/pkg/steam"
	"github.com/cheshire137/cheevo-plotter/pkg/util"
)

type SteamFriend struct {
	Id         string `json:"steamId"`
	Name       string `json:"name"`
	AvatarUrl  string `json:"avatarUrl"`
	ProfileUrl string `json:"profileUrl"`
}

type SteamFriendsResponse struct {
	Friends []*SteamFriend `json:"friends"`
}

func (e *Env) GetSteamFriendsHandler(w http.ResponseWriter, r *http.Request) {
	util.LogRequest(r)
	e.enableCors(&w)

	steamId, err := e.getCurrentSteamId(r)
	if err != nil {
		ErrorMessageJson(w, "Not authenticated", http.StatusUnauthorized)
		return
	}

	user, err := e.ds.GetSteamUser(steamId)
	if err != nil {
		ErrorJson(w, err)
		return
	}

	friends := []*SteamFriend{}
	cachedFriends, err := e.ds.GetSteamUsers(user.FriendIds)
	if err != nil {
		ErrorJson(w, err)
		return
	}

	existingFriendIds := map[string]bool{}
	for _, cachedFriend := range cachedFriends {
		existingFriendIds[cachedFriend.Id] = true
		friend := &SteamFriend{
			Id:         cachedFriend.Id,
			Name:       cachedFriend.Name,
			AvatarUrl:  cachedFriend.AvatarUrl,
			ProfileUrl: cachedFriend.ProfileUrl,
		}
		friends = append(friends, friend)
	}

	if len(user.FriendIds) != len(cachedFriends) {
		client := steam.NewClient(e.config.SteamApiKey)

		missingFriendIds := []string{}
		for _, friendId := range user.FriendIds {
			if !existingFriendIds[friendId] {
				missingFriendIds = append(missingFriendIds, friendId)
			}
		}

		friends, err := client.GetPlayerSummaries(missingFriendIds)
		if err != nil {
			ErrorJson(w, err)
			return
		}

		for _, friend := range friends {
			err = e.ds.UpsertSteamUser(data_store.NewSteamUser(friend))
			if err != nil {
				ErrorJson(w, err)
				return
			}
		}
	}

	sort.Slice(friends, func(i, j int) bool {
		nameA := strings.ToLower(friends[i].Name)
		nameB := strings.ToLower(friends[j].Name)
		return nameA < nameB
	})

	w.Header().Set("Content-Type", "application/json")
	response := SteamFriendsResponse{Friends: friends}
	json.NewEncoder(w).Encode(response)
}

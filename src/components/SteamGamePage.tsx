import React, { useState, useEffect } from 'react'
import Game from '../models/Game'
import Player from '../models/Player'
import Achievement from '../models/Achievement'
import PlayerSummary from '../models/PlayerSummary'
import AchievementsList from './AchievementsList'
import AchievementsComparison from './AchievementsComparison'
import PlayersList from './PlayersList'
import SteamGamePageHeader from './SteamGamePageHeader'
import useGetSteamID from '../hooks/use-get-steam-id'
import SteamUserError from './SteamUserError'
import { PageLayout, Spinner } from '@primer/react'

interface Props {
  steamUsername: string;
  game: Game;
  loadedPlayer: Player;
  selectedPlayers: Player[];
  playerSummary: PlayerSummary;
  onUsernameChange(newUsername: string): void;
  onGameChange(newGame: Game | null): void;
}

const SteamGamePage = ({ playerSummary, steamUsername, game, loadedPlayer, selectedPlayers, onUsernameChange, onGameChange }: Props) => {
  const { steamID, error: steamIDError, fetching: loadingSteamID } = useGetSteamID(steamUsername)
  const [achievementsBySteamID, setAchievementsBySteamID] = useState<{ [steamID: string]: Achievement[] }>({})

  const onGameIconUriChange = (newIconUri: string | null) => {
    const newGameData = Object.assign({}, game) as any
    newGameData.iconUri = newIconUri
    onGameChange(new Game(newGameData))
  }

  const onPlayerAchievementsLoaded = (player: Player, achievements: Achievement[]) => {
    setAchievementsBySteamID(Object.assign({}, achievementsBySteamID, { [player.steamid]: achievements }))
  }

  return <PageLayout>
    <PageLayout.Header>
      <SteamGamePageHeader playerSummary={playerSummary} game={game} steamUsername={steamUsername}
        onGameChange={onGameChange} />
    </PageLayout.Header>
    <PageLayout.Content>
      {loadingSteamID && <Spinner />}
      {steamIDError && <SteamUserError />}
      {selectedPlayers.length > 0 && !loadingSteamID && steamID && <PlayersList
        players={selectedPlayers}
        game={game}
        currentSteamID={steamID}
        onUsernameChange={onUsernameChange}
        onGameIconUriChange={onGameIconUriChange}
        onPlayerAchievementsLoaded={onPlayerAchievementsLoaded}
      />}
      {selectedPlayers.length < 1 ? <AchievementsList
        achievements={game.achievements}
      /> : <AchievementsComparison
        initialPlayers={selectedPlayers.concat([loadedPlayer])}
        achievementsBySteamID={achievementsBySteamID}
      />}
    </PageLayout.Content>
  </PageLayout>
}

export default SteamGamePage;

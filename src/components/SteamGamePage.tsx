import React, { useState } from 'react'
import Game from '../models/Game'
import Player from '../models/Player'
import Achievement from '../models/Achievement'
import PlayerSummary from '../models/PlayerSummary'
import AchievementsList from './AchievementsList'
import AchievementsComparison from './AchievementsComparison'
import PlayersList from './PlayersList'
import SteamGamePageHeader from './SteamGamePageHeader'
import { PageLayout } from '@primer/react'

interface Props {
  steamUsername: string;
  game: Game;
  loadedPlayer: Player;
  selectedPlayers: Player[];
  playerSummary: PlayerSummary;
  onUsernameChange(newUsername: string): void;
  onGameChange(newGame: Game | null): void;
  steamID: string;
}

const SteamGamePage = ({ playerSummary, steamID, steamUsername, game, loadedPlayer, selectedPlayers, onUsernameChange, onGameChange, onPlayerChange }: Props) => {

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
        onGameChange={onGameChange} totalAchievements={achievements.length} />
    </PageLayout.Header>
    <PageLayout.Content>
      {selectedPlayers.length > 0 && steamID && <PlayersList
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

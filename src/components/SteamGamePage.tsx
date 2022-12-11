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
  onPlayerChange(newPlayer: Player): void;
  steamID: string;
}

const SteamGamePage = ({ playerSummary, steamID, steamUsername, game, loadedPlayer, selectedPlayers, onUsernameChange, onGameChange, onPlayerChange }: Props) => {
  const [achievements, setAchievements] = useState<Achievement[]>([])

  const onGameIconUriChange = (newIconUri: string | null) => {
    const newGameData = Object.assign({}, game) as any
    newGameData.iconUri = newIconUri
    onGameChange(new Game(newGameData))
  }

  const onPlayerUnlockedAchievementsLoaded = (player: Player, unlockedAchievements: Achievement[]) => {
    const newPlayer = new Player(player.steamid, player.personaname)
    for (const achievement of unlockedAchievements) {
      newPlayer.addUnlockedAchievement(achievement)
    }
    onPlayerChange(newPlayer)
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
        onAchievementsLoaded={setAchievements}
        onPlayerUnlockedAchievementsLoaded={onPlayerUnlockedAchievementsLoaded}
      />}
      {selectedPlayers.length < 1 && achievements.length > 0 && <AchievementsList
        achievements={achievements}
      />}
      {achievements.length > 0 && selectedPlayers.length > 0 && <AchievementsComparison
        achievements={achievements}
        players={selectedPlayers.concat([loadedPlayer])}
      />}
    </PageLayout.Content>
  </PageLayout>
}

export default SteamGamePage;

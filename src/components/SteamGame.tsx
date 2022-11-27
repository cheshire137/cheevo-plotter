import React from 'react';
import SteamApps from '../stores/steamApps';

interface Props {
  appID: number;
  loadSteamApp(appID: number): void;
}

const SteamGame = ({ appID, loadSteamApp }: Props) => <li>
  <button type="button" onClick={() => loadSteamApp(appID)}>
    {SteamApps.getName(appID)}
  </button>
</li>

export default SteamGame;

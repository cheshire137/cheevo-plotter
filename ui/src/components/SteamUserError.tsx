import { Flash } from '@primer/react'

const SteamUserError = () => {
  return <Flash variant="danger">
    <p>Could not find Steam ID for that username.</p>
    <p>Try setting your custom URL in Steam:</p>
    <p><img src={require('./steam-edit-profile.jpg')} width="640" height="321" alt="Edit Steam profile" /></p>
    <p>Then, search here for the name you set in that custom URL.</p>
  </Flash>
}

export default SteamUserError

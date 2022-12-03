import React from 'react'

const SteamUserError = () => {
  return <div>
    <p>Could not find Steam ID for that username.</p>
    <p>Try setting your custom URL in Steam:</p>
    <p><img src={require('./steam-edit-profile.jpg')} width="640" height="321" alt="Edit Steam profile" /></p>
    <p>Then, search here for the name you set in that custom URL.</p>
  </div>
}

export default SteamUserError

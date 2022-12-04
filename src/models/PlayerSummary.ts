// https://partner.steamgames.com/doc/webapi/ISteamUser#GetPlayerSummaries
interface PlayerSummaryData {
  realname?: string;
  avatarmedium: string;
  steamid: string;
  profileurl: string;
  personaname: string;
  username?: string;
}

const getUsernameFromProfileUrl = (profileUrl: string) => {
  const needle = '/id/'
  const index = profileUrl.toLowerCase().indexOf(needle)
  if (index > -1) {
    return profileUrl.slice(index + needle.length).replace(/\/+$/, '')
  }
}

class PlayerSummary {
  realname: string | null;
  avatarmedium: string;
  steamid: string;
  profileurl: string;
  personaname: string;
  username: string | null;

  constructor(data: PlayerSummaryData) {
    this.realname = data.realname || null
    this.avatarmedium = data.avatarmedium
    this.steamid = data.steamid
    this.profileurl = data.profileurl
    this.personaname = data.personaname
    if (data.username) {
      this.username = data.username
    } else {
      this.username = getUsernameFromProfileUrl(data.profileurl) || null
    }
  }
}

export default PlayerSummary

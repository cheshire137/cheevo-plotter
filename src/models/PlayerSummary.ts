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

  compare(otherPlayerSummary: PlayerSummary) {
    if (this.steamid === otherPlayerSummary.steamid) {
      return 0
    }
    return this.getNormalizedPersonaName().localeCompare(otherPlayerSummary.getNormalizedPersonaName())
  }

  getNormalizedPersonaName() {
    return this.personaname.toLowerCase().replace(/^-/g, '').replace(/-$/g, '').replace(/[.'"-_]+/g, '')
  }
}

export default PlayerSummary

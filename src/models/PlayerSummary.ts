// https://partner.steamgames.com/doc/webapi/ISteamUser#GetPlayerSummaries
interface PlayerSummaryData {
  realname?: string;
  avatarmedium: string;
  steamid: string;
  profileurl: string;
  personaname: string;
}

class PlayerSummary {
  realname: string | null;
  avatarmedium: string;
  steamid: string;
  profileurl: string;
  personaname: string;

  constructor(data: PlayerSummaryData) {
    this.realname = data.realname || null
    this.avatarmedium = data.avatarmedium
    this.steamid = data.steamid
    this.profileurl = data.profileurl
    this.personaname = data.personaname
  }
}

export default PlayerSummary

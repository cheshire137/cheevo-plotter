class PlayerSummary {
  realname: string;
  avatarmedium: string;
  steamid: string;
  profileurl: string;
  personaname: string;

  constructor(realname: string, avatarmedium: string, steamid: string, profileurl: string, personaname: string) {
    this.realname = realname;
    this.avatarmedium = avatarmedium;
    this.steamid = steamid;
    this.profileurl = profileurl;
    this.personaname = personaname;
  }
}

export default PlayerSummary

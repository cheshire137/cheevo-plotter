import PlayerSummary from './PlayerSummary'

interface FriendData {
  friend_since?: number;
  friendSince?: string;
  relationship: string;
  steamid?: string;
  steamID?: string;
}

class Friend {
  steamID: string;
  relationship: string;
  friendSince: Date | null;
  playerSummary: PlayerSummary | null;

  constructor(data: FriendData) {
    if (data.steamid) {
      this.steamID = data.steamid
    } else if (data.steamID) {
      this.steamID = data.steamID
    } else {
      this.steamID = 'unknown'
    }
    this.relationship = data.relationship
    if (data.friend_since) {
      this.friendSince = new Date(data.friend_since * 1000)
    } else if (data.friendSince) {
      this.friendSince = new Date(data.friendSince)
    } else {
      this.friendSince = null
    }
    this.playerSummary = null;
  }
}

export default Friend

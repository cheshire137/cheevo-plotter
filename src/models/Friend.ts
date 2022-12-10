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

  compare(otherFriend: Friend) {
    if (this.steamID === otherFriend.steamID) {
      return 0
    }
    if (this.playerSummary && otherFriend.playerSummary) {
      return this.playerSummary.compare(otherFriend.playerSummary)
    }
    if (this.friendSince && otherFriend.friendSince) {
      if (this.friendSince < otherFriend.friendSince) return -1
      return this.friendSince > otherFriend.friendSince ? 1 : 0
    }
    return this.steamID.localeCompare(otherFriend.steamID)
  }
}

export default Friend

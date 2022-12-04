interface FriendData {
  friend_since: number;
  relationship: string;
  steamid: string;
}

class Friend {
  steamID: string;
  relationship: string;
  friendSince: Date;

  constructor(data: FriendData) {
    this.steamID = data.steamid;
    this.relationship = data.relationship;
    this.friendSince = new Date(data.friend_since * 1000);
  }
}

export default Friend

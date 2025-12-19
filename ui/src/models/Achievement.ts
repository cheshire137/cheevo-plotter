class Achievement {
  key: string;
  iconUri: string;
  name: string;

  constructor(iconUri: string, name: string, key: string) {
    this.iconUri = iconUri;
    this.name = name;
    this.key = key;
  }
}

export default Achievement

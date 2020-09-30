class DataStore {
  constructor(dbClient) {
    this.dbClient = dbClient;
  }

  async findUserAccount(gitID) {
    const [userID] = await this.dbClient
      .from('users')
      .select({ userID: 'id' })
      .where({ github_id: gitID })
      .then((rows) => Promise.resolve(rows));
    return userID;
  }

  async createUserAccount(accountInfo) {
    const { userName, githubID, avatarURL, fullName } = accountInfo;
    const [colCount] = await this.dbClient('users').insert({
      id: userName,
      github_id: githubID,
      avatar_url: avatarURL,
      full_name: fullName,
    });

    return colCount ? Promise.resolve() : Promise.reject();
  }

  async getUsersList() {
    const row = await this.dbClient
      .from('users')
      .select('id')
      .then((rows) => Promise.resolve(rows));
    console.log('getUsersList', row);
    return row;
  }

  async getUserInfo(userID) {
    const [row] = await this.dbClient
      .from('users')
      .select('id', 'full_name', 'avatar_url')
      .where({ id: userID })
      .then((rows) => Promise.resolve(rows));
    return row;
  }

  async getProfileData(userID) {
    const [row] = await this.dbClient
      .from('users')
      .select({ userID: 'id', fullName: 'full_name', src: 'avatar_url' })
      .where({ id: userID })
      .then((rows) => Promise.resolve(rows));
    return row;
  }
}

module.exports = { DataStore };

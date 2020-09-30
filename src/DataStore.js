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

  async getGroupsOf(userID) {
    const row = await this.dbClient
      .from('groups')
      .select({ groupName: 'group_name' })
      .where('member_names', 'like', `%${userID}%`);
    return row;
  }

  async getMembersOf(groupName) {
    const [{ names, groupID }] = await this.dbClient
      .from('groups')
      .select({ names: 'member_names', groupID: 'group_id' })
      .where({ group_name: groupName });
    const members = await this.dbClient
      .from('users')
      .select({ userID: 'id', fullName: 'full_name', src: 'avatar_url' })
      .whereIn('id', JSON.parse(names));
    return Promise.resolve({ groupName, members, groupID });
  }

  async getFeedBacks(userID, type) {
    const row = await this.dbClient
      .from('feedbacks')
      .select({
        id: 'feed_back_id',
        nameToShow: 'given_sender_name',
        recipient: 'recipient',
        relatedTo: 'topic',
        sender: 'sender',
        suggestion: 'suggestion',
        time: 'send_time',
      })
      .where({ [type]: userID })
      .then((rows) => Promise.resolve(rows));
    return row;
  }

  async addFeedBack(feedBack) {
    const { nameToShow, recipient, relatedTo, suggestion, sender } = feedBack;
    const [colCount] = await this.dbClient('feedbacks').insert({
      given_sender_name: nameToShow,
      recipient: recipient,
      topic: relatedTo,
      sender: sender,
      suggestion: suggestion,
      send_time: new Date(),
    });
    console.log(colCount);
    return colCount ? Promise.resolve({ added: true }) : Promise.reject();
  }
}

module.exports = { DataStore };

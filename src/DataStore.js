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
    await this.dbClient('users').insert({
      id: userName,
      github_id: githubID,
      avatar_url: avatarURL,
      full_name: fullName,
    });

    return Promise.resolve();
  }

  async getUsersList() {
    const row = await this.dbClient
      .from('users')
      .select('id')
      .then((rows) => Promise.resolve(rows));
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

  async addGroup(groupDetails) {
    const { groupID, groupName, user } = groupDetails;
    return await this.dbClient('groups')
      .insert({
        group_id: groupID,
        group_name: groupName,
        member_names: `${user}`,
      })
      .then(() => Promise.resolve({ added: true, groupID, groupName }))
      .catch(() => Promise.reject());
  }

  async getGroupsOf(userID) {
    const row = await this.dbClient
      .from('groups')
      .select({ groupName: 'group_name' })
      .where('member_names', 'like', `%${userID}%`);
    return row;
  }

  async getGroupDetails(ID) {
    const [row] = await this.dbClient
      .from('groups')
      .select({
        names: 'member_names',
        groupID: 'group_id',
        groupName: 'group_name',
      })
      .where({ group_id: ID });
    if (!row) {
      return Promise.resolve({
        found: false,
        errorMsg: 'group does not exists',
      });
    }
    const { names, groupID, groupName } = row;
    return Promise.resolve({
      found: true,
      groupName,
      memberNames: names.split(','),
      groupID,
    });
  }

  async getMembersOf(ID) {
    const groupDetails = await this.getGroupDetails(ID);
    if (!groupDetails.found) {
      return Promise.resolve(groupDetails);
    }
    const { groupName, memberNames, groupID } = groupDetails;
    const members = await this.dbClient
      .from('users')
      .select({ userID: 'id', fullName: 'full_name', src: 'avatar_url' })
      .whereIn('id', memberNames);
    return Promise.resolve({ members, groupName, groupID });
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
    return await this.dbClient('feedbacks')
      .insert({
        given_sender_name: nameToShow,
        recipient: recipient,
        topic: relatedTo,
        sender: sender,
        suggestion: suggestion,
        send_time: new Date(),
      })
      .then(() => Promise.resolve({ added: true }))
      .catch(() => Promise.reject());
  }
}

module.exports = { DataStore };

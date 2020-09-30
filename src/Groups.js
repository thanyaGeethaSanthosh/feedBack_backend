class Groups {
  constructor(db) {
    this.db = db;
  }

  getGroupsOf(userID) {
    return this.db
      .getGroupsOf(userID)
      .then((groupList) => Promise.resolve({ groupList }));
  }

  async getMembersOf(groupID) {
    const groupDetails = await this.db.getMembersOf(groupID);
    return groupDetails;
  }
}

module.exports = { Groups };

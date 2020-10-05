const getRandomString = (length = 10) => {
  const randomChars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
  }
  return result;
};

class Groups {
  constructor(db) {
    this.db = db;
  }

  addGroup(groupName, user) {
    const groupID = getRandomString();
    return this.db.addGroup({ groupName, user, groupID });
  }

  joinGroup(groupID, user) {
    return this.db
      .joinGroup({ user, groupID })
      .then((groupData) => Promise.resolve(groupData));
  }

  getGroupsOf(userID) {
    return this.db
      .getGroupsOf(userID)
      .then((groupList) => Promise.resolve({ groupList }));
  }

  getMembersOf(groupID) {
    return this.db
      .getMembersOf(groupID)
      .then((groupData) => Promise.resolve(groupData));
  }
}

module.exports = { Groups };

const validateUserID = function (userID) {
  return userID && !userID.match(/\s/);
};

class Users {
  constructor(db) {
    this.db = db;
  }

  findAccount(gitID) {
    return this.db
      .findUserAccount(gitID)
      .then((userAccount) => Promise.resolve(userAccount));
  }

  registerUser(userInfo) {
    const { fullName, userID } = userInfo;

    userInfo.fullName = fullName || 'Anonymous';

    return validateUserID(userID)
      ? this.db.createUserAccount(userInfo)
      : Promise.reject();
  }

  has(userID) {
    return this.db.getUsersList().then((usersList) => {
      const hasUser = usersList.find((user) => user.id === userID);
      return hasUser ? Promise.resolve(true) : Promise.resolve(false);
    });
  }

  getUser(userID) {
    return this.db.getUserInfo(userID).then((user) => Promise.resolve(user));
  }

  async getUserProfile(userID) {
    const profileInfo = await this.db.getProfileData(userID);

    if (!profileInfo) {
      throw new Error();
    }
    return profileInfo;
  }
}

module.exports = { Users };

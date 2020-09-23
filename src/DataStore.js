const { findAccount, userInfo, userProfile } = require('./queries.json');

class DataStore {
  constructor(dbClient) {
    this.dbClient = dbClient;
  }

  findUserAccount(gitID) {
    return new Promise((resolve) => {
      this.dbClient.get(findAccount, [gitID], (err, row) => {
        resolve(row);
      });
    });
  }

  createUserAccount(accountInfo) {
    const { userID, githubID, avatarURL, fullName } = accountInfo;
    const query = `
    INSERT INTO users(id, github_id, avatar_url, full_name) 
    VALUES (?,?,?,?);
    `;

    return new Promise((resolve, reject) => {
      this.dbClient.run(
        query,
        [userID, githubID, avatarURL, fullName],
        (err) => {
          if (err) {
            reject();
          } else {
            resolve();
          }
        }
      );
    });
  }

  getUsersList() {
    const query = 'SELECT id FROM users;';
    return new Promise((resolve) => {
      this.dbClient.all(query, (err, rows) => {
        resolve(rows);
      });
    });
  }

  getUserInfo(userID) {
    return new Promise((resolve) => {
      this.dbClient.get(userInfo, [userID], (err, row) => {
        resolve(row);
      });
    });
  }

  getProfileData(userID) {
    return new Promise((resolve) => {
      this.dbClient.get(userProfile, [userID], (err, row) => {
        resolve(row);
      });
    });
  }
}

module.exports = { DataStore };

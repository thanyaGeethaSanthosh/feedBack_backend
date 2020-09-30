const setExpirationAndResolve = function (dsClient, token, resolve) {
  dsClient.expire(`newReg_${token}`, 86400, () => {
    resolve(token);
  });
};

const createHashAndResolve = function (dsClient, accountInfo, token, resolve) {
  const { avatarURL, githubID } = accountInfo;
  dsClient.hmset(
    `newReg_${token}`,
    'githubID',
    githubID,
    'avatarURL',
    avatarURL,
    () => {
      setExpirationAndResolve(dsClient, token, resolve);
    }
  );
};

class SessionHandler {
  constructor(dsClient) {
    this.dsClient = dsClient;
  }

  incrID(idName) {
    return new Promise((resolve) => {
      this.dsClient.incr(idName, (err, incrementedID) => {
        resolve(incrementedID);
      });
    });
  }

  createSession({ userID }) {
    return new Promise((resolve) => {
      this.incrID('expSesID').then((sesID) =>
        this.dsClient.set(`expSes_${sesID}`, userID, 'EX', 2592000, () => {
          resolve(sesID);
        })
      );
    });
  }

  getSession(sesID) {
    return new Promise((resolve) => {
      this.dsClient.get(`expSes_${sesID}`, (err, userName) => {
        resolve(userName);
      });
    });
  }

  deleteSession(sesID) {
    return new Promise((resolve) => {
      this.dsClient.del(`expSes_${sesID}`, resolve);
    });
  }

  createTempToken(accountInfo) {
    return new Promise((resolve) => {
      this.incrID('tempToken').then((token) => {
        createHashAndResolve(this.dsClient, accountInfo, token, resolve);
      });
    });
  }

  getTokenValue(token) {
    return new Promise((resolve) => {
      this.dsClient.hgetall(`newReg_${token}`, (err, userInfo) => {
        resolve(userInfo);
      });
    });
  }

  deleteTempToken(token) {
    return new Promise((resolve) => {
      this.dsClient.del(`newReg_${token}`, resolve);
    });
  }

  closeClient() {
    this.dsClient.quit();
  }
}

module.exports = { SessionHandler };

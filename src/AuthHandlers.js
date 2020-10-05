const querystring = require('querystring');
const statusCodes = require('./statusCodes.json');

const redirectToGithub = function (req, res) {
  const { gitClientID } = req.app.locals;
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${gitClientID}`
  );
};

const authenticateUser = async function (req, res, next) {
  const { authenticator } = req.app.locals;

  authenticator
    .getAccessToken(req.query.code)
    .then((accessToken) => {
      authenticator.getUserInfo(accessToken).then((userInfo) => {
        req.body.gitUserInfo = userInfo;
        next();
      });
    })
    .catch(() => {
      res.sendStatus(statusCodes.unauthorized);
    });
};

const createSessionAndRedirect = async function (res, dataStore, userID, url) {
  const sesID = await dataStore.createSession(userID);
  res.cookie('sesID', sesID);
  res.redirect(url);
};

const redirectAuthenticated = async function (req, res, next) {
  const { users, sessionHandler, REACT_SERVER } = req.app.locals;
  const { githubID } = req.body.gitUserInfo;
  const userID = await users.findAccount(githubID);
  if (!userID) {
    return next();
  }

  createSessionAndRedirect(res, sessionHandler, userID, REACT_SERVER);
};

const takeToSignUp = async function (req, res) {
  const { sessionHandler, REACT_SERVER } = req.app.locals;
  const { githubID, avatarURL } = req.body.gitUserInfo;
  const registrationToken = await sessionHandler.createTempToken({
    githubID,
    avatarURL,
  });
  res.cookie('regT', registrationToken);
  res.redirect(`${REACT_SERVER}/signUp`);
};

const registerUser = async function (req, res, next) {
  const { users, sessionHandler } = req.app.locals;
  const registrationInfo = await sessionHandler.getTokenValue(req.cookies.regT);
  if (!registrationInfo) {
    res.sendStatus(statusCodes.unauthorized);
    return;
  }

  users
    .registerUser(Object.assign(registrationInfo, req.body))
    .then(() => {
      next();
    })
    .catch(() => {
      res.sendStatus(statusCodes.unprocessableEntity);
    });
};

const finishRegistration = async function (req, res) {
  const { sessionHandler, REACT_SERVER } = req.app.locals;
  const { userName } = req.body;
  await sessionHandler.deleteTempToken(req.cookies.regT);
  res.clearCookie('regT');
  createSessionAndRedirect(res, sessionHandler, userName, REACT_SERVER);
};

module.exports = {
  redirectToGithub,
  authenticateUser,
  redirectAuthenticated,
  takeToSignUp,
  registerUser,
  finishRegistration,
};

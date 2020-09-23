const querystring = require('querystring');
const statusCodes = require('./statusCodes.json');

const generateUrl = function (urlObject) {
  const { url, path, queryParams } = urlObject;
  return `${url}${path}?${querystring.stringify(queryParams)}`;
};

const redirectToGithub = function (req, res) {
  const { gitClientID } = req.app.locals;
  res.redirect(
    generateUrl({
      url: 'https://github.com',
      path: '/login/oauth/authorize',
      queryParams: {
        client_id: gitClientID,
        redirect_uri: 'http://localhost:3030/gitOauth/authCode',
      },
    })
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

const createSessionAndRedirect = async function (res, dataStore, userID) {
  const sesID = await dataStore.createSession(userID);
  res.cookie('sesID', sesID);
  res.redirect('/');
};

const redirectAuthenticated = async function (req, res, next) {
  const { users, sessionHandler } = req.app.locals;
  const { githubID } = req.body.gitUserInfo;
  const account = await users.findAccount(githubID);

  if (!account) {
    next();
    return;
  }

  createSessionAndRedirect(res, sessionHandler, account.userID);
};

const takeToSignUp = async function (req, res) {
  const { sessionHandler } = req.app.locals;
  const { userID, userName, githubID, avatarURL } = req.body.gitUserInfo;
  const registrationToken = await sessionHandler.createTempToken({
    githubID,
    avatarURL,
  });
  res.cookie('regT', registrationToken);
  res.send(`<form action="/signUp" method="POST">
    <div >Sign up</div>
    <div ><label for="userID">Username</label><input id="userName" type="text" name="userID" required="required" /></div>
    <div><label for="displayName">Display Name</label><input id="displayName" type="text" name="fullName" required="required" /></div>
    <div ><input class="inactive" id="submitBtn" type="submit" value="sign up" /></div>
</form>`);
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
  console.log('called me');
  const { sessionHandler } = req.app.locals;
  const { userID } = req.body;

  await sessionHandler.deleteTempToken(req.cookies.regT);
  res.clearCookie('regT');

  createSessionAndRedirect(res, sessionHandler, userID);
};

module.exports = {
  redirectToGithub,
  authenticateUser,
  redirectAuthenticated,
  takeToSignUp,
  registerUser,
  finishRegistration,
};

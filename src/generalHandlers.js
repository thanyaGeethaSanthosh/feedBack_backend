const statusCodes = require('./statusCodes.json');

const attachUserIfSignedIn = async function (req, res, next) {
  const { users, sessionHandler } = req.app.locals;
  req.user = { isSignedIn: false };

  const userID = await sessionHandler.getSession(req.cookies.sesID);
  if (userID) {
    req.user = await users.getUser(userID);
    req.user && (req.user.isSignedIn = true);
  }

  next();
};

const authorizeUser = function (req, res, next) {
  if (!(req.user && req.user.isSignedIn)) {
    res.sendStatus(statusCodes.unauthorized);
    return;
  }
  next();
};

const closeSession = async function (req, res) {
  const { sesID } = req.cookies;
  const { sessionHandler } = req.app.locals;
  sesID && (await sessionHandler.deleteSession(sesID));
  res.clearCookie('sesID');
  res.redirect('/');
};

// eslint-disable-next-line no-unused-vars
const handleUnprocessableEntity = function (error, req, res, next) {
  res.status(statusCodes.unprocessableEntity);
  res.send({ error: error.message });
};

module.exports = {
  attachUserIfSignedIn,
  authorizeUser,
  closeSession,
  handleUnprocessableEntity,
};

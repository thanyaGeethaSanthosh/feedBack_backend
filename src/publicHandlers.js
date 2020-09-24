const statusCodes = require('./statusCodes.json');
const serveHomepage = function (req, res, next) {
  if (req.user && req.user.isSignedIn) {
    next();
    return;
  }
  res.redirect('http://localhost:3000/');
};

const getUserData = async function (req, res) {
  const { users, sessionHandler } = req.app.locals;
  const { sesID } = req.cookies;
  const userName = await sessionHandler.getSession(sesID);
  users
    .getUserProfile(userName)
    .then((userProfile) => {
      res.json({ user: userProfile, loggedIn: true });
    })
    .catch(() => {
      res.json({ loggedIn: false });
    });
};

const getOtherUserData = async function (req, res) {
  const { users } = req.app.locals;
  const { userName } = req.params;
  users
    .getUserProfile(userName)
    .then((userProfile) => {
      res.send({ user: userProfile, loggedIn: true });
    })
    .catch(() => {
      res.sendStatus(statusCodes.notFound);
    });
};

module.exports = {
  serveHomepage,
  getUserData,
  getOtherUserData,
};

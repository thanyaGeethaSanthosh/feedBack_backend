const serveHomepage = function (req, res, next) {
  if (req.user && req.user.isSignedIn) {
    next();
    return;
  }
  res.send('<a href="http://localhost:3030/authenticate">login</a>');
};

module.exports = {
  serveHomepage,
};

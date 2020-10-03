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
  const { user } = req;
  users
    .getUser(userName)
    .then((userProfile) => {
      res.json({ otherUser: userProfile, user: user, loggedIn: true });
    })
    .catch(() => {
      res.json({ loggedIn: false });
    });
};

const addFeedBack = async function (req, res) {
  const { feedbacks } = req.app.locals;
  const { userID } = req.user;
  feedbacks
    .addFeedBack(userID, req.body)
    .then((response) => {
      res.json(response);
    })
    .catch(() => {
      res.json({ added: false, error: 'some error in adding feedBack' });
    });
};

const getSentFeedBacks = async function (req, res) {
  const { feedbacks } = req.app.locals;
  const { userID } = req.user;
  feedbacks
    .getSentFeedBacks(userID)
    .then((response) => {
      res.json(response);
    })
    .catch(() => {
      res.json({ error: 'some error in getting feedBacks' });
    });
};

const getReceivedFeedBacks = async function (req, res) {
  const { feedbacks } = req.app.locals;
  const { userID } = req.user;
  feedbacks
    .getReceivedFeedBacks(userID)
    .then((response) => {
      res.json(response);
    })
    .catch(() => {
      res.json({ error: 'some error in getting feedBacks' });
    });
};

const addGroup = async function (req, res) {
  const { groups } = req.app.locals;
  const { userID } = req.user;
  const { groupName } = req.params;
  groups
    .addGroup(groupName, userID)
    .then((response) => {
      res.json(response);
    })
    .catch(() => {
      res.json({ added: false, error: 'some error in creating group' });
    });
};

const getGroupMembers = async function (req, res) {
  const { groups } = req.app.locals;
  //have to remove self from group
  const { userID } = req.user;
  const { groupName } = req.params;
  groups
    .getMembersOf(groupName)
    .then((response) => {
      res.json(response);
    })
    .catch(() => {
      res.json({ error: 'some error in getting feedBacks' });
    });
};

const getGroupsOf = async function (req, res) {
  const { groups } = req.app.locals;
  //have to remove self from group
  const { userID } = req.user;
  groups
    .getGroupsOf(userID)
    .then((response) => {
      res.json(response);
    })
    .catch(() => {
      res.json({ error: 'some error in getting feedBacks' });
    });
};

module.exports = {
  getUserData,
  getOtherUserData,
  addFeedBack,
  getSentFeedBacks,
  getReceivedFeedBacks,
  getGroupMembers,
  getGroupsOf,
  addGroup,
};

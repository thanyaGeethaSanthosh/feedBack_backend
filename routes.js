const express = require('express');
const logger = require('morgan');
const redis = require('redis');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const { Authenticator } = require('./src/Authenticator');
const { DataStore } = require('./src/DataStore');
const { SessionHandler } = require('./src/SessionHandler');
const { Users } = require('./src/Users');
const { FeedBacks } = require('./src/FeedBacks');
const { Groups } = require('./src/Groups');

const {
  NO_LOG,
  GIT_CLIENT_ID,
  GIT_CLIENT_SECRET,
  REDIS_URL,
  REDIS_DB,
  REACT_SERVER,
} = process.env;

const config = require('./knexfile');
const knex = require('knex')(config);

const {
  attachUserIfSignedIn,
  authorizeUser,
  closeSession,
  handleUnprocessableEntity,
} = require('./src/generalHandlers');

const {
  redirectToGithub,
  authenticateUser,
  redirectAuthenticated,
  takeToSignUp,
  registerUser,
  finishRegistration,
} = require('./src/AuthHandlers');

const {
  getUserData,
  getOtherUserData,
  addFeedBack,
  getSentFeedBacks,
  getReceivedFeedBacks,
  getGroupMembers,
  getGroupsOf,
  addGroup,
  joinGroup,
} = require('./src/publicHandlers');

const app = express();

app.locals.noLog = NO_LOG;
app.locals.REACT_SERVER = REACT_SERVER || '';
app.locals.gitClientID = GIT_CLIENT_ID || 'myId123';

app.locals.authenticator = new Authenticator(
  axios,
  GIT_CLIENT_ID,
  GIT_CLIENT_SECRET
);

const dsClient = redis.createClient({
  url: REDIS_URL || 'redis://127.0.0.1:6379',
  db: REDIS_DB,
});

app.locals.sessionHandler = new SessionHandler(dsClient);

const dataStore = new DataStore(knex);

app.locals.users = new Users(dataStore);
app.locals.feedbacks = new FeedBacks(dataStore);
app.locals.groups = new Groups(dataStore);

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('build'));

app.get('/api/authenticate', redirectToGithub);
app.get(
  '/gitOauth/authCode',
  authenticateUser,
  redirectAuthenticated,
  takeToSignUp
);

app.post('/api/signUp', registerUser, finishRegistration);

app.get('/api/logout', closeSession);
app.get('/api/getUserData', getUserData);
app.use('/api/*', attachUserIfSignedIn);
app.get('/api/user/:userName', getOtherUserData);
app.post('/api/addFeedBack', addFeedBack);
app.get('/api/getSentFeedBacks', getSentFeedBacks);
app.get('/api/getReceivedFeedBacks', getReceivedFeedBacks);
app.get('/api/createGroup/:groupName', addGroup);
app.get('/api/joinGroup/:groupID', joinGroup);
app.get('/api/getGroupMembers/:groupID', getGroupMembers);
app.get('/api/getGroupsOf', getGroupsOf);
app.get('/*', function (req, res) {
  res.sendFile(`${__dirname}/build/index.html`);
});

app.use(authorizeUser);

app.use(handleUnprocessableEntity);

module.exports = { app };

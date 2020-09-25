const express = require('express');
const logger = require('morgan');
const redis = require('redis');
const Sqlite3 = require('sqlite3').verbose();
const cookieParser = require('cookie-parser');
const axios = require('axios');
const { Authenticator } = require('./Authenticator');
const { DataStore } = require('./DataStore');
const { SessionHandler } = require('./SessionHandler');
const { Users } = require('./Users');
const { FeedBacks } = require('./FeedBacks');

const {
  NO_LOG,
  GIT_CLIENT_ID,
  GIT_CLIENT_SECRET,
  REDIS_URL,
  REDIS_DB,
  DB_PATH,
} = process.env;

const {
  attachUserIfSignedIn,
  authorizeUser,
  closeSession,
  handleUnprocessableEntity,
} = require('./generalHandlers');

const {
  redirectToGithub,
  authenticateUser,
  redirectAuthenticated,
  takeToSignUp,
  registerUser,
  finishRegistration,
} = require('./authHandlers');

const {
  serveHomepage,
  getUserData,
  getOtherUserData,
  addFeedBack,
  getSentFeedBacks,
  getReceivedFeedBacks,
} = require('./publicHandlers');

const app = express();

app.locals.noLog = NO_LOG;
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

const dbClient = new Sqlite3.Database(DB_PATH || ':memory:');
const dataStore = new DataStore(dbClient);
app.locals.dbClientReference = dbClient;
app.locals.users = new Users(dataStore);
app.locals.feedbacks = new FeedBacks(dataStore);

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/api/authenticate', redirectToGithub);
app.get(
  '/gitOauth/authCode',
  authenticateUser,
  redirectAuthenticated,
  takeToSignUp
);

app.post('/api/signUp', registerUser, finishRegistration);

app.get('/', serveHomepage);
app.get('/api/logout', closeSession);
app.get('/api/getUserData', getUserData);
app.use(attachUserIfSignedIn);
app.get('/api/user/:userName', getOtherUserData);
app.post('/api/addFeedBack', addFeedBack);
app.get('/api/getSentFeedBacks', getSentFeedBacks);
app.get('/api/getReceivedFeedBacks', getReceivedFeedBacks);

app.use(authorizeUser);

app.use(handleUnprocessableEntity);

module.exports = { app };

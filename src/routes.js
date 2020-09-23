const express = require('express');
const redis = require('redis');
const Sqlite3 = require('sqlite3').verbose();
const cookieParser = require('cookie-parser');
const axios = require('axios');
const { Authenticator } = require('./Authenticator');
const { DataStore } = require('./DataStore');
const { SessionHandler } = require('./SessionHandler');
const { Users } = require('./Users');

const {
  NO_LOG,
  GIT_CLIENT_ID,
  GIT_CLIENT_SECRET,
  REDIS_URL,
  REDIS_DB,
  DB_PATH,
} = process.env;

const {
  logRequest,
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

const { serveHomepage } = require('./publicHandlers');

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

app.use(logRequest);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/authenticate', redirectToGithub);
app.get(
  '/gitOauth/authCode',
  authenticateUser,
  redirectAuthenticated,
  takeToSignUp
);

app.get('/signOut', closeSession);

app.post('/signUp', registerUser, finishRegistration);

app.get('/', serveHomepage);
app.use(attachUserIfSignedIn);

app.use(authorizeUser);

app.use(handleUnprocessableEntity);

module.exports = { app };

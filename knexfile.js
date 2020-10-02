const { DATABASE_URL } = process.env;

module.exports = {
  client: 'pg',
  connection: DATABASE_URL,
  migrations: { directory: `${__dirname}/migrations` },
};

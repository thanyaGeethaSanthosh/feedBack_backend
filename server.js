const { app } = require('./routes');
const PORT = process.env.PORT || 3030;

app.listen(PORT, () => {
  process.stdout.write(`Server listening on ${PORT} \n`);
});

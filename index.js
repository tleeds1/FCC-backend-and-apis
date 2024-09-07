const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let urlDatabase = {};

app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const _id = Math.floor(Math.random() * 1000000).toString();
  urlDatabase[_id] = {username, exercises: []}
  res.json({ username, _id })
})

app.get('/api/users', (req, res) => {
  const users = Object.keys(urlDatabase).map(id => ({
    _id: id,
    username: urlDatabase[id].username
  }));
  res.json(users);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  if (!urlDatabase[_id]) {
    return res.json({ error: 'user not found' });
  }
  const exercise = {
    description: description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  };
  urlDatabase[_id].exercises.push(exercise);
  res.json({
    _id: _id,
    username: urlDatabase[_id].username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date
  });
})

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  if (!urlDatabase[_id]) {
    return res.json({ error: 'user not found' });
  }

  let log = urlDatabase[_id].exercises;

  if (from || to) {
    log = log.map(exercise => {
      exercise.date = new Date(exercise.date).toDateString();
      return exercise;
    });
  }

  if (from && to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    log = log.filter(exercise => new Date(exercise.date) >= fromDate && new Date(exercise.date) <= toDate);
  }

  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  res.json({
    _id: _id,
    username: urlDatabase[_id].username,
    count: log.length,
    log: log
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

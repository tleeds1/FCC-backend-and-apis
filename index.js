require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


let urlDatabase = {};
let idCounter = 1;

// POST route to create a short URL
app.post('/api/shorturl', function(req, res) {
  const url = req.body.url;
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

  if (!urlRegex.test(url)) {
    res.json({ error: 'invalid url' });
  } else {
    const shortUrlId = idCounter++;
    urlDatabase[shortUrlId] = url; 
    res.json({ original_url: url, short_url: shortUrlId });
  }
});

app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrlId = req.params.short_url;
  const originalUrl = urlDatabase[shortUrlId];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

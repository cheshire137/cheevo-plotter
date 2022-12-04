const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;
const steamApiKey = process.env.STEAM_API_KEY;

app.use(express.static(path.join(__dirname, 'public')));

const allowedOrigins = ['http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error())
    }
  }
}))

app.get('/ping', function (req, res) {
 return res.send('pong');
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/steam', async (req, res, next) => {
  let url = req.query.path;
  let isXml = false;
  for (var key in req.query) {
    if (key !== 'path') {
      const joiner = url.indexOf('?') > -1 ? '&' : '?';
      url = url + joiner + key + '=' + encodeURIComponent(req.query[key]);
    }
    if (key === 'xml') {
      isXml = true;
    }
  }
  console.log('Steam API request:', isXml ? 'XML' : 'JSON', url);
  if (isXml) {
    url = 'http://steamcommunity.com' + url;
  } else {
    const joiner = url.indexOf('?') > -1 ? '&' : '?'
    url = 'http://api.steampowered.com' + url + joiner + 'key=' + steamApiKey;
  }
  const response = await fetch(url);
  const data = isXml ? await response.text() : await response.json();
  if (isXml) {
    res.set('Content-Type', 'text/xml');
  }
  res.send(data);
});

console.log("Starting server on port " + port);
if (typeof steamApiKey === 'undefined' || steamApiKey.length < 1) {
  console.error("No Steam API key found, set in STEAM_API_KEY");
} else {
  console.log("Have Steam API key");
}
app.listen(port);

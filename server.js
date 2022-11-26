const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

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
  if (isXml) {
    url = 'http://steamcommunity.com' + url;
  } else {
    url = 'http://api.steampowered.com' + url +
          (url.indexOf('?') > -1 ? '&' : '?') + 'key=' +
          process.env.STEAM_API_KEY;
  }
  const response = await fetch(url);
  const data = isXml ? await response.text() : await response.json();
  if (isXml) {
    res.set('Content-Type', 'text/xml');
  }
  res.send(data);
});

const port = process.env.PORT || 8080;
console.log("Starting server on port " + port);
app.listen(port);
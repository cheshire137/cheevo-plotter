const express = require('express')
const cors = require('cors')
const path = require('path')
const app = express()
const port = process.env.PORT || 8080
const steamApiKey = process.env.STEAM_API_KEY

app.use(express.static(path.join(__dirname, 'public')))

const allowedOrigins = ['http://localhost:3000']
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`))
    }
  }
}))

app.get('/ping', function (req, res) {
  return res.send('pong')
})

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.get('/api/steam', async (req, res, next) => {
  let url = req.query.path
  for (var key in req.query) {
    if (key !== 'path') {
      const joiner = url.includes('?') ? '&' : '?'
      url = `${url}${joiner}${key}=${encodeURIComponent(req.query[key])}`
    }
  }
  console.log('Steam JSON API request:', url)
  const joiner = url.includes('?') ? '&' : '?'
  url = `http://api.steampowered.com${url}${joiner}key=${steamApiKey}`
  const response = await fetch(url)
  let data
  try {
    data = await response.json()
  } catch (e) {
    res.status(400)
    console.error('Error parsing response for', req.query.path, e)
    data = { error: e.message }
  }
  res.send(data)
})

console.log("Starting server on port " + port)
if (typeof steamApiKey === 'undefined' || steamApiKey.length < 1) {
  console.error("No Steam API key found, set in STEAM_API_KEY")
} else {
  console.log("Have Steam API key")
}
app.listen(port)

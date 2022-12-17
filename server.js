const express = require('express')
const cors = require('cors')
const path = require('path')
const session = require('express-session')
const app = express()
const SteamAuth = require('node-steam-openid')
const backendPort = process.env.PORT || 8080
const steamApiKey = process.env.STEAM_API_KEY
const backendUrl = `http://localhost:${backendPort}`
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
const steamCallbackPath = '/auth/steam/callback'
const steam = new SteamAuth({
  realm: backendUrl,
  returnUrl: `${backendUrl}${steamCallbackPath}`,
  apiKey: steamApiKey,
})

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {secure: true}
}))
app.use(express.static(path.join(__dirname, 'public')))

const allowedOrigins = [frontendUrl]
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

app.get('/auth/steam', async (req, res) => {
  console.log('Steam authentication started, redirecting...')
  const redirectUrl = await steam.getRedirectUrl()
  return res.redirect(redirectUrl)
})

app.get(steamCallbackPath, async (req, res) => {
  console.log('Steam authentication callback...')
  try {
    const user = await steam.authenticate(req)
    console.log('authenticated as Steam user', user.username)
    req.session.user = user
    return res.redirect(`${frontendUrl}?steamid=${user.steamid}`)
  } catch (error) {
    console.error('Steam auth error:', error)
  }
})

app.get('/api/steam/user', (req, res, next) => {
  if (req.session.user) {
    res.send(req.session.user)
  } else {
    res.status(401).send({ error: 'Not logged in' })
  }
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

console.log("Starting server on port " + backendPort)
if (typeof steamApiKey === 'undefined' || steamApiKey.length < 1) {
  console.error("No Steam API key found, set in STEAM_API_KEY")
} else {
  console.log("Have Steam API key")
}
app.listen(backendPort)

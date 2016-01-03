# Cheevo Plotter

View your Steam achievements over time.

## How to Develop

Get a [Steam Web API Key](http://steamcommunity.com/dev/apikey).

    cp src/env.sh.example src/env.sh

Customize src/env.sh.

    npm install
    npm start

Visit [localhost:3000](http://localhost:3000/).

You can update the list of Steam apps/games with:

    npm run update-steam-apps

## How to Deploy to Heroku

1. [Add an app on heroku.com.](https://dashboard.heroku.com/new)
1. `heroku git:remote -a your_heroku_app_name`
1. `heroku config:set STEAM_API_KEY="your Steam Web API Key"`
1. `npm run build`
1. `git subtree push --prefix build heroku master`

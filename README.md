# Cheevo Plotter

Compare your Steam achievements with your friends'.

![Screenshot](https://raw.githubusercontent.com/cheshire137/cheevo-plotter/master/screenshot.png)

## How to Develop

I'm using the following tool versions:

    % node --version
    v5.3.0
    % npm --version
    3.3.12

Get a [Steam Web API Key](http://steamcommunity.com/dev/apikey).

    cp src/env.sh.example src/env.sh

Customize src/env.sh.

    npm install
    npm start

Visit [localhost:3000](http://localhost:3000/).

You can update the cached list of Steam apps/games with:

    npm run update-steam-apps

## How to Deploy to Heroku

1. [Add an app on heroku.com.](https://dashboard.heroku.com/new)
1. `heroku git:remote -a your_heroku_app_name`
1. `heroku config:set STEAM_API_KEY="your Steam Web API Key"`
1. `./deploy.sh`

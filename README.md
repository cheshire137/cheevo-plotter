# Cheevo Plotter

Compare your Steam achievements with your friends'.

![Screenshot](https://raw.githubusercontent.com/cheshire137/cheevo-plotter/master/screenshot.png)

## How to Develop

I'm using the following tool versions:

    % node --version
    v23.11.0
    % npm --version
    11.5.2

Get a [Steam Web API Key](http://steamcommunity.com/dev/apikey).

    cd ui
    npm install
    STEAM_API_KEY="your API key here" SESSION_SECRET="some fun string you make up" node server.js
    npm start

Visit [localhost:3000](http://localhost:3000/).

You can update the cached list of Steam apps/games with:

    npm run update-steam-apps

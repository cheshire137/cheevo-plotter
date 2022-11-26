# Cheevo Plotter

Compare your Steam achievements with your friends'.

![Screenshot](https://raw.githubusercontent.com/cheshire137/cheevo-plotter/master/screenshot.png)

## How to Develop

I'm using the following tool versions:

    % node --version
    v18.12.1
    % npm --version
    8.19.2

Get a [Steam Web API Key](http://steamcommunity.com/dev/apikey).

    npm install
    STEAM_API_KEY="your API key here" node server.js
    npm start

Visit [localhost:3000](http://localhost:3000/).

You can update the cached list of Steam apps/games with:

    npm run update-steam-apps

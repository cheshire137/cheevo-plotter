/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import 'babel-core/polyfill';
import path from 'path';
import express from 'express';
import React from 'react';
import ReactDOM from 'react-dom/server';
import Router from './routes';
import Html from './components/Html';
import assets from './assets';
import { port } from './config';
import Config from './config.json';
import fetch from './core/fetch';

const server = global.server = express();

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
server.use(express.static(path.join(__dirname, 'public')));

//
// Register API middleware
// -----------------------------------------------------------------------------
server.use('/api/content', require('./api/content'));

server.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin',
             Config[process.env.NODE_ENV].clientUri);
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

server.get('/api/steam', async (req, res, next) => {
  var url = req.query.path;
  var isXml = false;
  for (var key in req.query) {
    if (key !== 'path') {
      var joiner = url.indexOf('?') > -1 ? '&' : '?';
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

//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------
server.get('*', async (req, res, next) => {
  try {
    let statusCode = 200;
    const data = { title: '', description: '', css: '', body: '', entry: assets.main.js };
    const css = [];
    const context = {
      insertCss: styles => css.push(styles._getCss()),
      onSetTitle: value => data.title = value,
      onSetMeta: (key, value) => data[key] = value,
      onPageNotFound: () => statusCode = 404,
    };

    await Router.dispatch({ path: req.path, query: req.query, context }, (state, component) => {
      data.body = ReactDOM.renderToString(component);
      data.css = css.join('');
    });

    const html = ReactDOM.renderToStaticMarkup(<Html {...data} />);
    res.status(statusCode).send('<!doctype html>\n' + html);
  } catch (err) {
    next(err);
  }
});

//
// Launch the server
// -----------------------------------------------------------------------------
server.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`The server is running at http://localhost:${port}/`);
});

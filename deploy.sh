#!/bin/sh

npm run build
git add build/ && git commit -m "Update build/"
git subtree push --prefix build heroku master

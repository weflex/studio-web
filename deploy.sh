#!/usr/bin/env sh

rm -rf dist
make heroku

REMOTE=`git remote -v | grep origin | grep push | awk '{print $2}'`
cd dist

git init
git add .
git commit -a -m 'update gh-pages'
git checkout -b 'gh-pages'
git push $REMOTE 'gh-pages' --force

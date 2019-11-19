#!/usr/bin/env bash
echo Install App Files...
export npm_loc='/usr/local/lib/node_modules/@angular/cli/node_modules/'
rm -rf ${npm_loc}/@custom
mkdir -p ${npm_loc}/@custom/mycloudapp
cp -R ./src/cloud-app/files/* ${npm_loc}/@custom/mycloudapp/
npm run build
npm install




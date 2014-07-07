#!/usr/bin/env bash
echo "Installing Thematic Ghost"
echo "-------------------------"
echo "Copying default config.js file into Ghost directory"
`cp ./scripts/config.js.template ./node_modules/ghost/config.js`
`./node_modules/.bin/bower install`
# symbolic link back to the theme we're developing
echo "creating symbolic link for Theme registration"
cd ./node_modules/ghost/content/themes
`ln -s ../../../../public ThematicGhost`
cd -
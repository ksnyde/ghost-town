# Thematic Ghost #

This repo grew out of the need to service two key use-cases:

1. Allow tech entrepreneurs to deploy quick a single-page app for a newly created company. This would include the ability to:
	- Have a static cover page, an "about page", a "blog", and a "contact us" page out of the box
	- Provide a secure interaction with MailChimp for subscribe/unsubscribe list management
	- 
2. Provide theme developers for Ghost an efficient asset pipeline for building these themes.
	- Allow use of SASS style sheets that compile down to CSS automatically
	- Provide 

![ ](documentation/images/services.png)

is intended to help you build an asset-pipeline for Ghost blogging themes. The asset pipeline leverages [Broccoli](https://github.com/broccolijs) to ensure that your SASS scripts are compiled, your JS concatinated, and your bower packaged included. As the image above illustrates visually, this package will do the following:

- `theme` - provide a sandbox for you to work on all your theme templates, styles, and JS
- `public` - provide a "compiled", ready-to-use ghost theme that is available in real-time (or at least microseconds away from real-time)
- `Ghost server` - provides a default Ghost server that points to your template to allow you to see the effects of your theme changes in real time

## Out of the Box ##

The "default theme" that comes out of the box is heavily based on the popular [GhostScroll](https://github.com/grmmph/GhostScroll/) theme which is ideally suited for building a pre-release marketing website. You can, of course go anywhere you like with how you design your theme and the underlying pipeline will support any amount of customisation (the assumption here is that you're not afraid of coding ... this is after all a programmer-friendly repo). That said, the default theme does have some nice starting points to get you moving quickly which include:

- Bootstrap for SASS v3.1
- Bourbon (SASS library)
- Velocity (animation on steriods)
- FontAwesome (reusable icons in the form of vector fonts)
- HightlightJS (make your code look great)

## Installation ##

To install a **Thematic Ghost** working template go to an appropriate directory and run the following:

````
git clone https://github.com/ksnyde/thematic-ghost
npm install -g broccoli-cli
cd thematic-ghost
npm install
````

This will:

- install all the required npm modules (which includes Ghost itself), 
- then the bower modules, 
- and then link your dynamic theme to the Ghost instance (so the "ThematicGhost" theme is an available option).

You're mostly done but in order to operate effectively you'll need to install **nginx** to front the services[^why-nginx]. To install this will be somewhat variant based on the OS your running. For OSX it is as simple as:

`brew install nginx` (assuming you're using the **brew** package manager)

On ubuntu it is using the built in apt-get:

`sudo apt-get install nginx`

Anyway, it should be pretty easy to get it installed, then configuring it you'll want to heavily borrow from the example configuration file that comes with this repo. You can find the example at `nginx.conf.example` in the root folder of this repo. Copy it to the appropriate place for your OS[^nginx-config-file] or merge into your existing configuration if you're already using nginx.


[^why-nginx]: **nginx** is being used as a reverse proxy and is sometimes considered a more production-hardened forward face for your blog, that said, the real reason we're using it here is more to do with the fact that integration with MailChimp is insecure if done from the browser and therefore a server proxy is necessary and **nginx** allows us to offer this proxy on the same URL and avoid all the cross-site security issues that otherwise would present themselves.

[^nginx-config-file]: `/usr/local/etc/nginx/nginx.conf` if installed with brew on OSX, `/etc/nginx/nginx.conf` on Ubuntu

## Usage ##

The basic commands are available via the npm submenu:

- `npm start` - starts all required services (asset build, ghost, chimp proxy)

The environment variables include:

- `NODE_ENV` - either 'production' or 'development'
- `GHOST_USER_ID` - the *user* who should own the assets/files
- `GHOST_GROUP_ID` - the *group* who should be given ownership for the assets/files



## Pull Requests ##

Very open to PR's to make this a better product. I would like to keep the overall JS and CSS weight to a minimum though so consider adding your contributions as a "partial template" that can be easily added if needed rather than as an already included module. 

> Note: there may be a more graceful/effective way of enable/disabling these additional modules but I haven't had time to think of what that would be yet ... open to suggestions

## License
All of thematic-ghost is licensed under the MIT license.

Copyright (c) 2014 Ken Snyder

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
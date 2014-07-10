#!/usr/bin/env node --harmony

const
	broccoli = require('./broccoli-watcher'),
	chimp = require('./chimp-proxy'),
	ghost = require('ghost'),
	chalk = require('chalk'),
	path = require('path'),
	// LogServer = require('LogServer'),
	// LogHarvester = require('LogHarvester'),
	env = process.env.NODE_ENV || 'development',
	logDirectory = process.env.GHOST_LOG_DIR || '/var/log/ghost';

switch(env) {
	case 'development':
		console.log("Thematic Ghost starting in " + chalk.green("Development") + " setup mode\n");
		// watch broccoli pipeline
		broccoli.watch('public');
		// start chimp API
		chimp.listen(4400);
		// start ghost server
		ghost().then(function () {
			console.log(chalk.green("ghost blogging service ready\n"));
			var shell = require('child_process').spawn;
			console.log(chalk.green("Launching browser to nginx driven reverse-proxy site.\n"));
			console.log("If the browser is blank start the server with 'sudo nginx' \n");
			shell('open', ['http://127.0.0.1:1080']);
		});
		break;
	case 'production':
		console.log("Thematic Ghost starting in " + chalk.green("Production") + " setup mode\n");
		console.log("Ghost platform will operate on directory " + path.resolve(__dirname));
		var shell = require('child_process').spawn;
		// shutdown forever processes
		
		// build asset pipeline
		broccoli.build('public');
		// start chimp API
		chimp.listen(4400);
		// start ghost
		// shell('sudo forever stopall');
		// shell('sudo NODE_ENV=production forever start --sourceDir /Users/Ken/repos/mine/ghost-town/node_modules/ghost index.js >> /Users/Ken/nodelog.txt 2>&1');
		ghost().then(function () {
			console.log(chalk.green("Ghost blogging service ready\n"));
		});
		break;
}
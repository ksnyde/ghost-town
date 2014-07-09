#!/usr/bin/env node --harmony

const
	broccoli = require('./broccoli-watcher'),
	chimp = require('./chimp-proxy'),
	ghost = require('ghost'),
	chalk = require('chalk'),
	// LogServer = require('LogServer'),
	// LogHarvester = require('LogHarvester'),
	env = process.env.NODE_ENV || 'development';

switch(env) {
	case 'development':
		console.log("Thematic Ghost operating in " + chalk.green("Development") + " setup mode\n");
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
		// build asset pipeline
		broccoli.build('public');
		// start chimp API
		chimp.listen(4400);	
		// start ghost
		ghost().then(function () {
			console.log(chalk.green("Ghost blogging service ready\n"));
		});
		break;
}
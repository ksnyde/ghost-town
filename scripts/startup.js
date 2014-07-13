#!/usr/bin/env node
/*jslint node: true */
/*jshint strict:true */
'use strict';

var
	broccoli = require('./broccoli-watcher'),
	chimp = require('./chimp-proxy'),
	ghost = require('ghost'),
	chalk = require('chalk'),
	path = require('path'),
	// LogServer = require('LogServer'),
	// LogHarvester = require('LogHarvester'),
	env = process.env.NODE_ENV || 'development',
	logDirectory = process.env.GHOST_LOG_DIR || '/var/log/ghost',
	downgradedUser = process.env.GHOST_USER_ID || 'unknown',
	downgradedGroup = process.env.GHOST_GROUP_ID || 'www-data';
	
// readiness check
if(env === "production" && downgradedUser === "unknown") {
	console.log(chalk.red("No GHOST_USER_ID environment variable was set!\n"));
	console.log("this is required when targeting the production environment");
	return null;
}
	
var isPortTaken = function(port, fn) {
  var net = require('net');
  var tester = net.createServer()
  .once('error', function (err) {
    return fn(true,port);
  })
  .once('listening', function() {
	tester
		.once('close', function() { 
			fn(false,port);
		})
		.close();
	})
	.listen(port);
};

function cmdLine(cmd, args, callBack ) {
    var spawn = require('child_process').spawn;
    var child = spawn(cmd, args);
    var resp = "";

    child.stdout.on('data', function (buffer) { resp += buffer.toString(); });
    // child.stdout.on('end', function() { callBack (resp) });
	child.on('exit', function(code,signal) {
		if(signal) {
			console.log(chalk.red("Error: [" + signal + "]: ") + "abnormal termination!");
			callBack(resp,code,signal);
			return;
		} else {
			callBack(resp,code,signal);
		}
	});
}

switch(env) {
	case 'development':
		console.log(chalk.green("Thematic Ghost starting in " + chalk.bold("Development") + " setup mode"));
		isPortTaken(1080, function(cond) {
			if(cond) {
				console.log(chalk.grey("Ok. Someone's listening on port 1080 which we'll assume is nginx (desired outcome)."));
			} else {
				console.log(chalk.grey("Nothing's listening on port 1080; use " + chalk.underline("sudo nginx") + " to start the reverse proxy."));
			}
		});
		// watch broccoli pipeline
		broccoli.watch('public');
		// start chimp API
		chimp.listen(4400);
		// start ghost server
		ghost().then(function () {
			var shell = require('child_process').spawn;
			console.log(chalk.green("Launching browser to nginx driven reverse-proxy site: ") + chalk.underline("http://localhost:1080"));
			shell('open', ['http://127.0.0.1:1080']);
		});
		break;
	case 'production':
		var rootDir = path.resolve(__dirname + '/..');
		var shell = require('child_process').spawn;
		console.log(chalk.green("Thematic Ghost starting in " + chalk.bold("Production") + " setup mode"));
		console.log(" - ghost will use " + chalk.blue(rootDir) + " as the root directory.");
		// shutdown forever processes
		var forever = shell('forever', ['stopall', '-s']);
		forever.stderr.on('data', function (data) {
			console.log('stderr: ' + data);
		});
		forever.on('close', function (code) {
			if(code === 0) {
				console.log(chalk.green("All pre-existing 'forever' services shut down."));				
			} else {
				console.log(chalk.red("There were problems shutting down pre-existing 'forever' services. Code " + code));								
				console.log(chalk.grey(" - continuing anyway but please pay extra attention to state"));
			}
			// now restart the forever processes
			var ghostParams = [
				'NODE_ENV=production',
				'forever', 
				'--sourceDir', rootDir + '/node_modules/ghost',
				'--pidFile', logDirectory + '/ghost.pid',
				'--uid', 'ghost',
				'start', 
				'-a',
				'-l', "ghost.forever.log",
				'-e', logDirectory + "/ghost.error.log",
				'-o', logDirectory + "/ghost.info.log",
				'index.js'			
			];
			var ghostForever = shell('sudo',ghostParams);
			ghostForever.on('exit', function(code,signal) {
				if(signal || code !== 0) {
					console.log(chalk.red("Ghost Error: [" + code + "]: ") + "there was an abnormal termination in setting up the Ghost service!");
					// return;
				} else {
					console.log(chalk.green("Ghost server started with " + chalk.bold('forever') + " on port 2368."));
					console.log(chalk.grey("  - log files can be found in " + chalk.underline(logDirectory)));
					console.log(chalk.grey("  - the crontab file should have the following entry in it (to ensure it runs at startup): \n\t" + chalk.inverse(' sudo ' + ghostParams.join(' ') + ' ') ));
				}
			});
			// MailChimp Proxy
			var chimpParams = [
				'NODE_ENV=production',
				'forever', 
				'--sourceDir', rootDir + '/scripts', 
				'--pidFile', logDirectory + '/chimp.pid',
				'--uid', 'chimp',
				'start', 
				'-a',
				'-l', "chimp.forever.log",
				'-e', logDirectory + "/chimp.error.log",
				'-o', logDirectory + "/chimp.info.log",
				'chimpStart.js'			
			];
			var chimpForever = shell('sudo', chimpParams);
			chimpForever.on('exit', function(code,signal) {
				if(signal || code !== 0) {
					console.log(chalk.red("Chimp Error: [" + code + "]: ") + "there was an abnormal termination in setting up the Chimp service!");
					return;
				} else {
					console.log(chalk.green("Chimp server started with " + chalk.bold('forever') + " on port 4400."));
					console.log(chalk.grey("  - log files can be found in " + chalk.underline(logDirectory)));
					console.log(chalk.grey("  - the crontab file should have the following entry in it (to ensure it runs at startup): \n\t" + chalk.inverse(' sudo ' + chimpParams.join(' ') + ' ') ));
				}
			});			
		});
		// one-time Broccoli build
		var rm = shell('sudo',['rm','-rf',rootDir + "/public"]); 
		rm.on('exit',function(code,signal) {
			if(code !== 0) {
				console.log(chalk.red('Build: problems removing the "public" directory prior to build.'));
				return;
			} else {
				var builder = shell('broccoli',['build','public']);
				builder.on('exit',function(code,signal) {
					if(code !== 0) {
						console.log(chalk.red('Build [' + code + ']:') + ' problems building new "public" directory');
						return;
					} else {
						console.log(chalk.green("Broccoli build successful"));
						var chown = shell('chown',['-R', downgradedUser, 'public']);
						chown.on('exit',function(code,signal) {
							if(code !== 0) {
								console.log(chalk.red('Build [' + code + ']:') + ' problems changing ownership on "public" directory to ' + chalk.bold(downgradedUser) + '.');
								return;
							} else {
								console.log(" - ownership permissions to " + chalk.green("public") + " directory changed to " + chalk.green(downgradedUser));
								var chgrp = shell('chgrp',['-R', downgradedGroup, 'public']);
								chgrp.on('exit',function(code,signal) {
									if(code !== 0) {
										console.log(chalk.red('Build: problems changing group ownership on "public" directory to ' + chalk.bold(downgradedGroup) + '.'));
										return;
									} else {
										console.log(" - group ownership permissions to " + chalk.green("public") + " directory changed to " + chalk.green(downgradedGroup));
									}
								}); // end chgrp
							}
						}); // end chown
					}
				}); // end build
			} 
		}); // end rm -rf
		// validate that HTTP server on port 80/443 is up and running
		var expectedPorts = [80,443];
		console.log("Checking that nginx is running on 'expected' ports: " + JSON.stringify(expectedPorts));
		for (var i in expectedPorts) {
			isPortTaken(expectedPorts[i], function(taken, port) {
				if(taken) {
					console.log(chalk.green(" - Service operating on " + port));
				} else {
					console.log(chalk.blue(" - No service listening on " + port));
				}	
			});
		}
		break;
	default:
		console.log("Environment set to unknown state: " + env);
		break;
}
#!/usr/bin/env node 
'use strict';

var 
	express = require('express'),
	connect = require('connect'),
	bodyParser = require('body-parser'),
	logger = require('morgan'),
	chalk = require('chalk'),
	service = express();
// add node's body parser to middelware
service.use(logger('dev'));
service.use(bodyParser.urlencoded({ extended: true }));	
	
var 
	MailChimpAPI = require('mailchimp').MailChimpAPI,
	apiKey = '27505fe88068079febf4c461990296dc-us4',
	listId = '6276927180';
	
var mandrill = require('mandrill-api/mandrill'),
	mandrillApiKey = 'y7e-qVXXFLGKseGgd5pkkg',
	serverEmailAddress = 'ken@ken.net',
	companyName = 'LifeGadget',
	mandrillClient = new mandrill.Mandrill(mandrillApiKey);

	
function monkeyRegister(req,res,notify) {
	console.log('Registering user', req.params.email);
	// initialise MailChimp API
	try {
		var api = new MailChimpAPI(apiKey, { version : '2.0' });
	} catch (error) {
		console.log(error.message);
	}
	api.call('lists', 'subscribe', { id: listId, email: { email: req.params.email}, merge_vars: req.body}, function (error, data) {
		console.log('Mailchimp has responded to: ' + req.params.email);
		if (data) {
			console.log(data);
		}
		if (error) {
			console.log("error!");
			// MailChimp returns a 214 error when the user already exists in the list
			if (error.code === 214) {
				res.json(409, error.message);
			} else {
				res.json(error.code, error.message);
			}
			console.log(error.message);
		} else {
			console.log("success!");
			res.json(200, data);
		}
	});
}

function provideFeedback(req,res) {
	
}

function sendContactUs(req,res) {
	var message = {
		subject: "Contact Us message from " + req.params.email,
		text: req.body.customerMessage,
		from_email: req.params.email,
		from_name: req.body.name,
		to: [
			{ 
				email: serverEmailAddress,
				type: "to"
			}
		],
		headers: {
			"Reply-To": "do-not-reply@lifegadget.co"
		},
		important: false,
		tags: [ 'website', 'contact-us']
	};
	mandrillClient.messages.send({"message": message, "async": false, "ip_pool": null, "send_at": null}, function(result) {
		console.log("Contact us message from " + req.params.email + " sent to server at " + serverEmailAddress, result);
		// res.json(200, result);
	}, function(e) {
		console.log("Mandrill error sending email to server", e);
		res.json(500, e);
	});
}

function sendThankYouMessage(req,res) {
	var message = {
		subject: "Thank you for reaching out",
		html: 'We received the following message from you:<br><pre>' + req.body.customerMessage + '</pre><br/>Thank you for reaching out to us. Please note that we read messages in the order they come in and try to provide prompt responses (if that\'s appropriate for your message). We are usually good with response time but like most start-ups we occasionally can get a bit behind so please be patient if you don\'t get an immediate response ... we <i>will</i> get back to you.<br/><p>&nbsp;</p>Thanks once again.<br/><b>' + companyName + '</b>',
		from_email: serverEmailAddress,
		from_name: companyName,
		to: [
			{ 
				email: serverEmailAddress,
				type: "to"
			}
		],
		headers: {
			"Reply-To": "do-not-reply@lifegadget.co"
		},
		important: false,
		tags: [ 'website', 'contact-us']
	};
	mandrillClient.messages.send({"message": message, "async": false, "ip_pool": null, "send_at": null}, function(result) {
		console.log("Contact us message to user " + req.params.email + " sent.");
		res.json(200, result);
	}, function(e) {
		console.log("Mandrill error sending email to server", e);
		res.json(500, e);
	});
}


function listen(port) {
	var listenPort = port || 4400;
	// console.log("setting up listener for MailChimp proxy ... " + listenPort);
	console.log(chalk.green("Starting up MailChimp proxy service.\n") + "Listening on port " + listenPort + '.');
	
	// define proxy services
	service.post('/register/:email', function(req,res) {
		monkeyRegister(req,res,true);
	});
	service.post('/moreInfo/:email', function(req,res) {
		monkeyRegister(req,res,false);
	});
	service.post('/profileEmail/:email', function(req,res) {
		monkeyProfileEmail(req,res);
	});
	service.post('/contact/:email', function(req,res) {
		console.log('contact email from: ' + req.params.email, req.body);
		sendContactUs(req,res);
		sendThankYouMessage(req,res);
	});
	// handle exits
	var atExit = function() { 
		console.log("\nChimp proxy " + chalk.bold("shutting down"));
	};
	process.on('SIGINT', atExit);
	process.on('SIGTERM', atExit);
	process.on('uncaughtException', function(err) {
		console.log("\nChimp proxy ran into problems:", err);
	});
	
	service.listen(listenPort);
}

function on(event, callback) {
	return service.on(event,callback);
}

exports.listen = listen;
exports.on = on;
	

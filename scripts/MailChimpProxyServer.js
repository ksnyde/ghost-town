#!/usr/bin/env node --harmony
'use strict';

var 
express = require('express'),
connect = require('connect'),
bodyParser = require('body-parser'),
chalk = require('chalk'),
service = express();
// add node's body parser to middelware
service.use(bodyParser.json());	
	
var 
MailChimpAPI = require('mailchimp').MailChimpAPI,
apiKey = '27505fe88068079febf4c461990296dc-us4',
listId = '6276927180';
	
function monkeyRegister(req,res,notify) {
	api.call('lists', 'subscribe', { id: listId, email: { email: req.params.email}, merge_vars: req.body}, function (error, data) {
		console.log('Mailchimp has responded to: ' + req.params.email, error, data);
		if (error) {
			// MailChimp returns a 214 error when the user already exists in the list
			if (error.code === 214) {
				res.json(409, error.message);
			} else {
				res.json(403, error.message);				
			}
			console.log(error.message);
		}
		else {
			console.log(chalk.dim(JSON.stringify(data))); // Do something with your data!
			res.json(200, data);
		}
	});
}
	
// initialise MailChimp API
try {
	var api = new MailChimpAPI(apiKey, { version : '2.0' });
} catch (error) {
	console.log(error.message);
}
// define proxy services
service.post('/register/:email', function(req,res) {
	monkeyRegister(req,res,true);
});

service.post('/moreInfo/:email', function(req,res) {
	monkeyRegister(req,res,false);
});
	
service.listen(4400, function() {
	console.log(chalk.green('MailChimp proxy service started.'));
});
	


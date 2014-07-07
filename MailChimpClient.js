#!/usr/bin/env node

var MailChimpAPI = require('mailchimp').MailChimpAPI;

var apiKey = '27505fe88068079febf4c461990296dc-us4';
var listId = '6276927180';

try { 
    var api = new MailChimpAPI(apiKey, { version : '2.0' });
} catch (error) {
    console.log(error.message);
}

// api.call('campaigns', 'list', { start: 0, limit: 25 }, function (error, data) {
//     if (error)
//         console.log(error.message);
//     else
//         console.log(JSON.stringify(data)); // Do something with your data!
// });

// api.call('campaigns', 'template-content', { cid: '/* CAMPAIGN ID */ }, function (error, data) {
//     if (error)
//         console.log(error.message);
//     else
//         console.log(JSON.stringify(data)); // Do something with your data!
// });

api.call('lists', 'members', { id: listId, start: 0, limit: 25 }, function (error, data) {
    if (error) {
        console.log(error.message);
		console.log("\n----- END LIST ------\n");    	
    } else {
		console.log("\n----- BEGIN LIST ------\n");    	
    	console.log(JSON.stringify(data)); // Do something with your data!
		console.log("\n----- END LIST ------\n");    	
    }
        
});

api.call('lists', 'subscribe', { id: listId, email: { email: 'ken+test999@ken.net'}}, function (error, data) {
    if (error)
        console.log(error.message);
    else
        console.log(JSON.stringify(data)); // Do something with your data!
});

api.call('lists', 'subscribe', { id: listId, email: { email: 'ken+test999@ken.net'}, merge_vars: {'FNAME':'Bob', 'LNAME':'Smith' }, send_welcome: false}, function (error, data) {
    if (error)
        console.log(error.message);
    else
        console.log(JSON.stringify(data)); // Do something with your data!
});


// interestData = [
// 	{'interested':true, 'name':'User'},
// 	{'interested':true, 'name':'Other'}
// ];
// api.call('lists', 'update-member', { id: listId, email: { email: 'ken+test56@ken.net'}, merge_vars: {'FNAME':'Bob', 'LNAME':'Smith', 'COUNTRY': 'UK','GROUPINGS':{ 17021:interestData } }}, function (error, data) {
//     if (error)
//         console.log(error.message);
//     else
//         console.log(JSON.stringify(data)); // Do something with your data!
// });
#!/usr/bin/env node --harmony
'use strict';

var
	chimp = require('./chimp-proxy'),
	port  = process.env.CHIMP_PORT || 4400;
	
chimp.listen(port);
chimp.on('start', function() {
	console.log('started');
});
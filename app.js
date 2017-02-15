/*jslint node: true*/
/***
Author: Corey Gaspard
Create Date: 02.28.2016
***/

'use strict';
var packageJSON = require("./package.json");
console.log(packageJSON.name + " Version: " + packageJSON.version);
console.log("Description: " + packageJSON.description);

var restify = require('restify');

var staticserver = require("./libs/staticserver");

staticserver.setContentFolder("/pub");

var restServer = restify.createServer();
restServer.use(restify.bodyParser());
restServer.use(restify.gzipResponse());
restServer.use(restify.conditionalRequest());
restServer.use(staticserver.checkCache);
restServer.get(/^\/.*/, staticserver.getStaticContent);

restServer.listen(8585, function () {
  console.log('jsMVC listening at %s', restServer.url);
});

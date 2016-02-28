/*jslint node: true*/
/***
Author: Corey Gaspard
Create Date: 02.28.2016
***/

'use strict';
var packageJSON = require("./package.json");
console.log(packageJSON.name + " Version: " + packageJSON.version);
console.log("Description: " + packageJSON.description);

var fs = require("fs");
var restify = require('restify');
var seemless = require("seemless");

var staticserver = require("./libs/staticserver");

staticserver.setContentFolder("/pub");

var restServer = restify.createServer();
restServer.use(restify.bodyParser());
restServer.use(restify.gzipResponse());
restServer.use(restify.conditionalRequest());
restServer.use(staticserver.checkCache);

/// If set set a hostame for seemless, then it will use this inside the genearted api.
/// Use this to allow CORS when you have the server hosted on a different domain than the page
//seemless.serverRootPath = "http://email.mygait.com";
//seemless.serverRootPath = "http://localhost:8080";
// seemless.generateRoutesForClientAPIAccess(etrackerapi, "eTrackerServer", restServer);
// seemless.addObjectRoute('/js/etrackerapi.js', etrackerapi, "eTrackerServer", restServer);

restServer.get(/^\/.*/, staticserver.getStaticContent);

restServer.listen(8585, function () {
  console.log('jsMVC listening at %s', restServer.url);
});

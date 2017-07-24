/*jslint node: true*/
/***
Author: Corey Gaspard
Create Date: 02.28.2016
***/

'use strict';
var packageJSON = require("./package.json");
console.log(packageJSON.name + " Version: " + packageJSON.version);
console.log("Description: " + packageJSON.description);

var express = require("express");
const app = express();
app.use(express.static('pub'))

app.get('/', function (req, res) {
  res.redirect('/home');
});

app.get('/home', function(req, res) {
  res.sendfile(__dirname + '/pub/index.htm');
})

app.listen(8585, function () {
  console.log('jsMVC listening at %s', app.url);
});

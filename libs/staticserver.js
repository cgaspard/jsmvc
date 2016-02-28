/*jslint node: true*/
var fs = require('fs');
var mime = require("mime");
var path = require('path');
var appDir = path.dirname(require.main.filename);

var StaticServer = {

  contentFolder: "",

  /**
   * Set the path to the static content folder.  This should be a path relative to the root of the node application
   * @param {String} folder Path to the content
   */
  setContentFolder: function (folder) {
    StaticServer.contentFolder = folder;
  },

  checkCache: function (req, res, next) {
    //console.log("getStaticContent: " + appDir + StaticServer.contentFolder + "; URL: " + req.url);
    if (req.url == "/") {
      req.url = "/index.htm";
    }

    if (req.url.endsWith("/")) {
      req.url = req.url + "index.htm";
    }

    //var fs = require('fs');
    var fileToCheck = appDir +  StaticServer.contentFolder + req.url;
    if (fs.existsSync(fileToCheck)) {
      var lastModHeader = new Date(req.headers["if-modified-since"]);
      var stats = fs.statSync(fileToCheck);
      var mtime = stats.mtime;
      if (lastModHeader.getTime() == mtime.getTime()) {
        //Yes: then send a 304 header without image data (will be loaded by cache)
        console.log('Load Cache: ' + req.url);
        res.send(304);
        res.end();
        return;
      }
    }
    next();
  },

  getStaticContent: function (req, res, next) {
    console.log("getStaticContent: " + appDir + StaticServer.contentFolder + "; URL: " + req.url);

    if (req.url == "/") {
      req.url = "/index.htm";
    }

    if(req.url.endsWith("/")) {
      req.url = req.url + "index.htm";
    }

    if (req.url.indexOf("?") > -1) {
      req.url = req.url.substr(0, req.url.indexOf("?"));
    }

    var fileToServe = decodeURIComponent(appDir + StaticServer.contentFolder + req.url);

    console.log("File:" + fileToServe);

    fs.readFile(fileToServe, function (err, data) {
      if (err) {
        console.error(err);
        res.send(500);
        return next();
      }
      var myMimeType = mime.lookup(fileToServe);
      var myCharSet = mime.charsets.lookup(myMimeType);

      fs.stat(fileToServe, function (err2, stats) {
        if(err2) {
          console.error(err2);
          res.send(500);
          return next();
        } else {

          res.set('Last-Modified', stats.mtime);
          res.set('Content-Length', stats.size);
          res.set('Access-Control-Allow-Origin', '*');
          res.set('Access-Control-Request-Method', '*');
          res.set('Access-Control-Allow-Methods', 'OPTIONS, GET');
          res.set('Access-Control-Allow-Headers', '*');
          res.set('Content-Type', myMimeType + (myCharSet === undefined ? "" : ";charset=" + myCharSet));

          res.writeHead(200);
          res.write(data);
          res.end();
          next();
        }
      });
    });

  }
};

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (position === undefined || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}

module.exports = StaticServer;

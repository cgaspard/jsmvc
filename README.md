### JSMVC - Javascript Clientside MVC

JSMVC is an MVC library that works by loading javascript based models, views and html based templates.

Existing JS MVC libraries are more like templating engines instead of a true MVC setup.  So I built this library to have a true MVC clientside library for javascript.

This project contains a sample node server that you can run locally.  Here is how to get it running:

```
git clone git https://github.com/cgaspard/jsmvc.git

npm install

npm start or node app.js

Browse to http://localhsot:8585/
```

The MVC library doesn't really care how you setup your folder structure, but her is a sample of how you might configure the files on the server:

```
|-- index.htm
|-- libs
    |-- async.js
    |-- mvc.js
|-- MVC
    |-- Engines
        |-- pure.js
    |-- Models
        |-- home.js
        |-- today.js
    |-- Views
        |-- home.htm
        |-- home.js
        |-- today.htm
        |-- today.js
```

Models in JS MVC load data, and house it.  Views process that data and render to an in memory DOM.   The controller is responsible for taking rendered html, and inserting into the page DOM.

Here is a sample Model JS:
``` Javascript
var todayModel = {
  id: "today",
  load: function(callBack) {
    model = this;
    var today = new Date();
    model.data = {
      "helloMessage": "Whats up doc?"
    }
    callBack(model);
  }
};

/// Make home model an instance of MVC model
Model.call(todayModel);

(function() {
  return todayModel;
})();
```

Views Contain JS and HTML  Here is sample JS for the View:
``` Javascript
/// Inherit View object
todayView.prototype = Object.create(View.prototype);
todayView.prototype.constructor = todayView;

function todayView() {
  var view = this;

  /// Call super constructor
  View.call(view);
  view.id = "today";
  view.html = "/views/today.htm";
}

/// Auto rendering via template engine happens first, this is where you can do stuff after that
todayView.prototype.postrender = function(model, callBack) {
  var view = this;

  var testDiv = document.createElement("div");
  testDiv.innerHTML = 'Hello There from Render Function of Today';
  view.dom.appendChild(testDiv);

  view.dom.querySelector("#helloMessageContainer").innerHTML = model.data.helloMessage;

  callBack(null, view);
};

(function() {
  return new todayView();
})();
```
Here is a matching HTML for the todayView:
``` html
<html>
  <head>
    <link class="mvc-csslink" rel="stylesheet" href="/css/today.css">
  </head>
<body>
  <div id="todayScreen" class="mvc-template">
    <div class="jumbotron">
      <h1 id="helloMessageContainer">Your message will be here</h1>
      <p></p>
    </div>

  </div>
</body>
</html>
```

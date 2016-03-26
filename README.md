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

#### Here is a sample Model JS:
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

#### Views Contain JS and HTML  Here is sample JS for the View:
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
#### Here is a matching HTML for the todayView:
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

### Putting it together

#### The Index Page

This is how to initialize the MVC and display some views.  The sample node project actually uses a custom controller class which you can see in the source.  The controller should be utilized to consolidate navigation code.   We'll let the index page function as our controller in this example though.
``` html
<!DOCTYPE html>
<html lang="en">
  <head id="mvc-csscontainer">
    <title>MVC Test</title>
    <script src="/libs/mvc.js" type="text/javascript"></script>
    <script>
    var mvc = null;
    document.addEventListener("DOMContentLoaded", function(event) {
      var mvcOptions = {
        views: ["/views/home.js", "/views/today.js"],
        models: ["/models/home.js", "/models/today.js"]
      }
      mvc = new MVC(mvcOptions);
      mvc.init(/* controller, callback */);
      /// This is how you can be notified of MVC events
      mvc.addObserver({
        "type": "PreloadComplete",
        "notify": function(type, data) { }
      });
    });

    function doneRendering(err, viewRendered) {
      if(err) {
      } else {
        document.getElementById("mvc-screens").innerHTML = "";
        viewRendered.dom = document.getElementById("mvc-screens").appendChild(viewRendered.dom);
      }
    }
    function displayToday() {
      var viewObject = mvc.getView("today");
      var modelObject = mvc.getModel("today");
      /// Loads the model for a view
      modelObject.load(function(returnedModel) {
        /// We now have the data we want, so lets put it into the view
        viewObject.render(returnedModel, doneRendering);
      });
    }
    function displayHome() {
      var viewObject = mvc.getView("home");
      var modelObject = mvc.getModel("home");
      /// Loads the model for a view
      modelObject.load(function(returnedModel) {
        /// We now have the data we want, so lets put it into the view
        viewObject.render(returnedModel, doneRendering);
      });
    }
    </script>
  </head>
  <body>
    <button onclick="Controller.displayToday();">Show Today</button>
    <button onclick="Controller.displayHome();">Show Home</button>
    <div id="mvc-screens">
    </div>
  </body>
</html>
```

Clicking "Show Today" button would then load the model, then pass the model to the view and let the view render into the view.dom object.   From there, we insert that into the mvc-screens div.   Output from the above sample would be:

``` html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- ...  removed for readability ... -->
  </head>
  <body>
    <button onclick="Controller.displayToday();">Show Today</button>
    <button onclick="Controller.displayHome();">Show Home</button>
    <div id="mvc-screens">
      <div id="todayScreen" class="mvc-template">
        <div class="jumbotron">
          <h1 id="helloMessageContainer">Whats up doc?</h1>
          <p></p>
        </div>
        <div>Hello There from Render Function of Today</div>     
    </div>
  </body>
</html>
```

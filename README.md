### JSMVC - Javascript Clientside MVC

#### Documentation was out of date so I removed it.  Have a look at the sample for now to get a better understanding.

JSMVC is an MVC library that works by loading javascript based models, views and html based templates.

This project contains a sample node server that you can run locally.  Here is how to get it running:

```
git clone git https://github.com/cgaspard/jsmvc.git

npm install

npm start or node app.js

Browse to http://localhsot:8585/
```

### How to use JSMVC

JSMVC works by creating JS based views and models, and rendering them with HTML templates.  Its purpose is to give a framework for creating single page Javascript application that look and feel somewhat like server side rendering in traditioanl web development.  

It also contains a built in controller that is capable of routing hashtag based urls to particular views and models.

JSMVC is also capable of utilizing two rendering engines.   Handlebars, and Pure.js.   See the example project to learn how to work with each template engine type.

### Step 1 - the file system setup

JSMVC is not picky about the file structure of your application, but here is an example setup:

```
/app
    - libs
        - mvc.js
    - mvc
        - home.view.js
        - home.model.js
        - home.template.html
        - home.css
    - index.html
    - mvc.config.js
```
### Step 2 - include the jsmvc in your application page, and repload all of your views and models.

Inside your index.html, include jsmvc like this;

```html
    <script src="/libs/mvc.js" type="text/javascript"></script>
    <script>
      var mvc = null;
      document.addEventListener("DOMContentLoaded", function(event) {
        mvc = new MVC("/mvc.config.js");
      })
    </script>
```

Here is an example configuration that mvc.config.js for JSMVC:

```json
{
    "defaultHash": "#dom",                             /// The initial route to load
    "autoInit": true,                                  /// Default: true, Tells MVC that you want it to preload views, models and templates into memory
    "listenForHashChanges": true,                      /// Default: true, MVC will liseten for hash changes in the URL and change the view / model that is associated in the routes.
    "screenContainerSelector": "#mvc-screens",         /// This is where MVC will display the rendered view / template
    "cssContainerSelector": "#mvc-csscontainer",       /// If html templates contain CSS tags, they will be loaded into the DOM inside this object
    "templateSelector": ".mvc-template",               /// Given a html page, this points to the content that will be put into the view
    "views": ["/mvc/home.view.js"],                    /// Views to load
    "models": ["/mvc/home.model.js"],                  /// Models to load
    "routes": [{                                       /// These are the routes the the controller will register
        "pattern": "#home/:id/test/:name",             /// This is the hash pattern that will cause the view to render, the :id & :name can be used in the view code.   See example below.
        "view": "home",                                /// This is the view ID that will be loaded
        "model": "home"                                /// This is the model ID that will be loaded
    }]
}
```

### Step 3 - Build an html template, view and model, then make sure they are associated with a route inside your mvc.config.js

Here is a sample View in JSMVC:

```javascript
this.id = "home";
this.html = "/mvc/home.htm";   /// This is the path to the template that this view will use.
this.title = "Home";

/// Load even is fired after the view is rendered to the screen
this.on("load", function() {
  
  var testDiv = document.createElement("div");
  /// Notice this.parameters.id, these come from the hash route we registered "#home/:id/test/:name"
  /// this.parameters.id & name will either have a value or be undefined.
  testDiv.innerHTML = 'Hello There from Render Function, id: ' + this.parameters.id + ' name:' + this.parameters.name;
  alert(this.model.data.name);
  this.dom.appendChild(testDiv);
});
```

Here is a sample Model for JSMVC:

```javascript
model.id = "home";

model.load = function(id, name, test, callBack) {
  var model = this;
  model.data = {
    "name":"David",
    "age":55
  }
  callBack(null, model);
}
```

Here is a sample template:

```html
<html>
<body>
    <!-- This element and all its children will be cloned into the view.dom property -->
    <!-- It will be rendered into whatever is selected using the configuration property screenContainerSelector -->
  <div id="homeScreen" class="mvc-template"> 
    <div class="userName">Corey</div>
    <div class="userAge">39</div>
    <div id="combined">Nothing Here</div>
  </div>
</body>
</html>

```

Given this setup, it would then be possible to server this application and navigat to index.htm#home, and the view, model & template will be rendered inside the screenContainerSelector.

The MVC first create the view and model objects in memory, then it calls the load function on the model.  When the load function is done, the model is passed into the views render function.   The view is then able to manipulate the DOM objects inside thet template by using the view.dom property.    It can modify content before it is rendered to the screen, or after by registering event listeners for "load" and "renderviewstart".

More documentation to come later.   For now just use the example.
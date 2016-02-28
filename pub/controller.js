var Controller = {
  screenContainer: null,
  cssContainer: null,
  mvc: null,
  init: function(container, csscontainer, mvc) {
    Controller.screenContainer = container;
    Controller.cssContainer = csscontainer;
    Controller.mvc = mvc;
  },
  displayScreen: function(screenName) {
    var viewObject = mvc.getView(screenName);
    var modelObject = mvc.getModel(screenName);

    Controller.mvc.clearCSSImports();

    if(viewObject.css.length > 0) {
      Controller.importCSS(viewObject.css);
    }

    /// Loads the model for a view
    modelObject.load(function(thisView) {
      return function(returnedModel) {
        /// Clear the screen
        Controller.screenContainer.innerHTML = "";
        /// We now have the dom object we want, so lets put it into the main document the render
        thisView.render(returnedModel, doneRendering);
      }
    }(viewObject));

    function doneRendering(domObject) {

      viewObject.dom = Controller.screenContainer.appendChild(domObject);
      viewObject.dom.style.display = 'block';

      console.log("Done rendering: " + viewObject.id);

    }
  },

  importCSS: function(cssList) {
    for(var i = 0; i < cssList.length; i++) {
      Controller.cssContainer.appendChild(cssList[i]);
    }
  },

  displayTodayScreen: function() {
    Controller.displayScreen("today");
  },
  displayHomeScreen: function() {
    Controller.displayScreen("home");
  }
}

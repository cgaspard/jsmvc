function homeView() {
  var view = this;

  /// Make home view an instance of MVC view
  View.call(this);
  view.id = "home";
  view.dom = null;
  view.engine = "pure";
  view.directive = {
    ".userName": "name",
    ".userAge": "age",
    "#combined": "#{name} - #{age}"
  };
  view.html = "/views/home.htm";
  view.css = "";
}
/// Required to ineherit View poperly
homeView.prototype = Object.create(View.prototype);
homeView.prototype.constructor = homeView;

/// The data is available, the dom is loaded, so populated it
homeView.prototype.postrender = function(model, callBack) {
  view = this;
  console.log("Rendering " + view.id + " view, Model: " + model.id);
  var testDiv = document.createElement("div");
  testDiv.innerHTML = 'Hello There from Render Function';

  view.dom.appendChild(testDiv);

  callBack(view.dom);
};

(function() {
  return new homeView();
})();

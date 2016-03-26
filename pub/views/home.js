/// Ineherit View object
homeView.prototype = Object.create(View.prototype);
homeView.prototype.constructor = homeView;

function homeView() {
  var view = this;

  /// Call super constructor
  View.call(view);

  view.id = "home";
  view.engine = "pure";
  view.html = "/views/home.htm";
  view.directive = {
    ".userName": "name",
    ".userAge": "age",
    "#combined": "#{name} - #{age}"
  };
}

/// Auto rendering via template engine happens first, this is where you can do stuff after that
homeView.prototype.postrender = function(model, callBack) {
  view = this;

  var testDiv = document.createElement("div");
  testDiv.innerHTML = 'Hello There from Render Function';
  view.dom.appendChild(testDiv);

  callBack(null, view);
};

(function() {
  return new homeView();
})();

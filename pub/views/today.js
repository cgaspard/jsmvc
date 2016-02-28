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
  view = this;

  var testDiv = document.createElement("div");
  testDiv.innerHTML = 'Hello There from Render Function of Today';
  view.dom.appendChild(testDiv);

  view.dom.querySelector("#year").innerHTML = model.data.year;
  view.dom.querySelector("#month").innerHTML = model.data.month;
  view.dom.querySelector("#date").innerHTML = model.data.date;
  view.dom.querySelector("#hours").innerHTML = model.data.hours;
  view.dom.querySelector("#minutes").innerHTML = model.data.minutes;

  callBack(view.dom);
};

(function() {
  return new todayView();
})();

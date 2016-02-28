function todayView() {
  var view = this;
  view.myself = todayView;
  /// Make home view an instance of MVC view
  View.call(this);
  view.id = "today";
  view.css = "";
  view.html = "/views/today.htm";
}

/// Required to ineherit View poperly
todayView.prototype = Object.create(View.prototype);
todayView.prototype.constructor = todayView;

todayView.prototype.postrender = function(model, callBack) {
  view = this;
  var testDiv = document.createElement("div");
  testDiv.innerHTML = 'Hello There from Render Function of Today';

  view.dom.querySelector("#year").innerHTML = model.data.year;
  view.dom.querySelector("#month").innerHTML = model.data.month;
  view.dom.querySelector("#date").innerHTML = model.data.date;
  view.dom.querySelector("#hours").innerHTML = model.data.hours;
  view.dom.querySelector("#minutes").innerHTML = model.data.minutes;

  view.dom.appendChild(testDiv);

  callBack(view.dom);
};

(function() {
  return new todayView();
})();

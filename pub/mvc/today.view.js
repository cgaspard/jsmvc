
view.id = "today";
view.html = "/mvc/today.htm";

/// Auto rendering via template engine happens first, this is where you can do stuff after that
view.addEventListener("load", function() {
  var view = this;
  var testDiv = document.createElement("div");
  testDiv.innerHTML = 'Hello There from Render Function of Today';
  view.dom.appendChild(testDiv);

  view.dom.querySelector("#year").innerHTML = view.model.data.year;
  view.dom.querySelector("#month").innerHTML = view.model.data.month;
  view.dom.querySelector("#date").innerHTML = view.model.data.date;
  view.dom.querySelector("#hours").innerHTML = view.model.data.hours;
  view.dom.querySelector("#minutes").innerHTML = view.model.data.minutes;

  view.dom.querySelector("#helloMessageContainer").innerHTML = view.model.data.helloMessage;

});

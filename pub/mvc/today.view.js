
this.id = "today";
this.html = "/mvc/today.htm";
this.title = "Today";

/// Auto rendering via template engine happens first, this is where you can do stuff after that
this.addEventListener("load", function() {
  // var this = this;
  var testDiv = document.createElement("div");
  testDiv.innerHTML = 'Hello There from Render Function of Today';
  this.dom.appendChild(testDiv);

  this.dom.querySelector("#year").innerHTML = this.model.data.year;
  this.dom.querySelector("#month").innerHTML = this.model.data.month;
  this.dom.querySelector("#date").innerHTML = this.model.data.date;
  this.dom.querySelector("#hours").innerHTML = this.model.data.hours;
  this.dom.querySelector("#minutes").innerHTML = this.model.data.minutes;

  this.dom.querySelector("#helloMessageContainer").innerHTML = this.model.data.helloMessage;

});

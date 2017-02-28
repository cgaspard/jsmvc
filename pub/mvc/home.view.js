this.id = "home";
this.engine = "pure";
this.html = "/mvc/home.htm";
this.title = "Home";
this.directive = {
  ".userName": "name",
  ".userAge": "age",
  "#combined": "#{name} - #{age}"
};

this.addEventListener("load", function() {
  
  var testDiv = document.createElement("div");
  testDiv.innerHTML = 'Hello There from Render Function, id: ' + this.parameters.id + ' name:' + this.parameters.name;
  this.dom.appendChild(testDiv);
});
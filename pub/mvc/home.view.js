view.id = "home";
view.engine = "pure";
view.html = "/mvc/home.htm";
view.directive = {
  ".userName": "name",
  ".userAge": "age",
  "#combined": "#{name} - #{age}"
};

view.addEventListener("load", function() {
  
  var testDiv = document.createElement("div");
  testDiv.innerHTML = 'Hello There from Render Function, id: ' + this.parameters.id + ' name:' + this.parameters.name;
  this.dom.appendChild(testDiv);
});
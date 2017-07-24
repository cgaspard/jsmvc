this.id = "pure";
this.engine = "pure";
this.html = "/mvc/pure.htm";
this.title = "Home";
this.directive = {
  ".userName": "name",
  ".userName@id": "something",
  ".userAge": "age",
  "#combined": "#{name} - #{age}",
  ".userName@style+": " display:none;",
  "#something":""
};

this.addEventListener("load", function() {
  var testDiv = document.createElement("div");
  testDiv.innerHTML = 'Hello There from Render Function, id: ' + this.parameters.id + ' name:' + this.parameters.name;
  this.dom.appendChild(testDiv);
});
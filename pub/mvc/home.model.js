
model.id = "home";

model.load = function(id, name, test, callBack) {
  var model = this;
  model.data = {
    "name":"David",
    "age":55
  }
  callBack(null, model);
}
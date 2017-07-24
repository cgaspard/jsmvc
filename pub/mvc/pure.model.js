model.id = "pure";

model.load = function(id, name, callBack) {
  var model = this;
  model.data = {
    "name":"David",
    "age":55
  }
  callBack(null, model);
}
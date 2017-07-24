model.id = "pure";

model.load = function(id, name, callBack) {
  console.log("pure model load, id: " + id + " name:" + name);
  var model = this;
  model.data = {
    "name":"David",
    "age":55
  }
  callBack(null, model);
}

model.id = "handle";

model.load = function(callBack) {
  var model = this;
  model.data = {
    "title":"Handlebars works",
    "body": "This is some text."
  }
  callBack(null, model);
}

model.id = "ejs";

model.load = function(callBack) {
  var model = this;
  model.data = {
    "title":"EJS works",
    "showit": true,
    "ejsbody": "This is some text rendered by the EJS engine."
  }
  callBack(null, model);
}




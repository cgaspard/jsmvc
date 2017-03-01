
this.id = "ejs";

this.load = function(callBack) {
  var model = this;
  model.data = {
    "title":"EJS works",
    "ejsbody": "This is some text rendered by the EJS engine.",
    "functionname": "mvc.view.dosomething"
  }
  callBack(null, model);
}




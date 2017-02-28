
this.id = "handle";

this.load = function(callBack) {
  var model = this;
  model.data = {
    "title":"Handlebars works",
    "body": "This is some text.",
    "functionname": "mvc.view.dosomething"
  }
  callBack(null, model);
}




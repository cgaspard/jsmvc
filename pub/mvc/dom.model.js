
this.id = "dom";
this.load = function(callBack) {
  var model = this;
  var today = new Date();
  model.data = {
    "year": today.getFullYear(),
    "month": today.getMonth()+1,
    "date": today.getDate(),
    "hours": today.getHours(),
    "minutes": today.getMinutes(),
    "helloMessage": "Whats up doc?"
  }
  callBack(null, model);
}

this.save = function(callBack) {
  
}

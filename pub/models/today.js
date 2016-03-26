var todayModel = {
  id: "today",
  load: function(callBack) {
    model = this;
    var today = new Date();
    model.data = {
      "year": today.getFullYear(),
      "month": today.getMonth()+1,
      "date": today.getDate(),
      "hours": today.getHours(),
      "minutes": today.getMinutes(),
      "helloMessage": "Whats up doc?"
    }
    callBack(model);
  }
};

/// Make home model an instance of MVC model
Model.call(todayModel);

(function() {
  return todayModel;
})();

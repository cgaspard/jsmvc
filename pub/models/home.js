var homeModel = {
  id: "home",
  load: function(callBack) {
    model = this;
    model.data = {
      "name":"David",
      "age":55
    }
    callBack(null, model);
  }
};

/// Make home model an instance of MVC model
Model.call(homeModel);

(function() {
  return homeModel;
})();

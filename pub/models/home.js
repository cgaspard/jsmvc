var homeModel = {
  id: "home",
  load: function(callBack) {
    model = this;
    model.data = {
      "name":"test",
      "age":55,
      "class@name":"et-username"
    }
    callBack(model);
  }
};

/// Make home model an instance of MVC model
Model.call(homeModel);

(function() {
  return homeModel;
})();

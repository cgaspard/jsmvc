/// MVC library
var MVC = function(options) {
  mvc = this;
  if (options === undefined) {
    options = {};
  }
  mvc.options = options;
  mvc.views = [];
  mvc.models = [];
  mvc.observers = [];
}

MVC.prototype.addObserver = function(observer) {
  this.observers.push(observer);
}

MVC.prototype.notify = function(type, data) {
  for(var i = 0; i < this.observers.length; i++) {
    var observer = this.observers[i];
    if(observer.type === undefined) {
      observer.notify(type, data);
    } else if(observer.type === type) {
      observer.notify(type, data);
    }
  };
}

MVC.prototype.init = function(controller, callBack) {
  var mvc = this;
  var doneLoadingViews = false;
  var doneLoadingModels = false;
  mvc.controller = controller;

  if (mvc.options.views !== undefined && mvc.options.views.length > 0) {
    for (var i = 0; i < mvc.options.views.length; i++) {
      mvc.addView(mvc.options.views[i], function(innerCallBack) {
        return function() {
          donePreLoadingViews(innerCallBack);
        }
      }(callBack))
    }

    function donePreLoadingViews(innerCallBack2) {
      if (mvc.views.length === mvc.options.views.length) {
        doneLoadingViews = true;
        doneLoadingViewsAndModels(innerCallBack2);
      }
    }
  }
  if (mvc.options.models !== undefined && mvc.options.models.length > 0) {
    for (var m = 0; m < mvc.options.models.length; m++) {
      mvc.addModel(mvc.options.models[m], function(innerCallBack) {
        return function() {
          donePreLoadingModels(innerCallBack);
        }
      }(callBack))
    }

    function donePreLoadingModels(innerCallBack3) {
      if (mvc.models.length === mvc.options.models.length) {
        doneLoadingModels = true;
        doneLoadingViewsAndModels(innerCallBack3);
      }
    }
  }

  function doneLoadingViewsAndModels(realCallBack) {
    if (doneLoadingModels && doneLoadingViews) {
      mvc.notify("PreloadComplete", null);
      if(realCallBack !== undefined) {
        realCallBack();
      }
    }
  }
}

MVC.prototype.clearCSSImports = function() {
  var dynamicCSSs = document.querySelectorAll(".mvc-csslink");
  if(dynamicCSSs.length > 0) {
    for(var i = 0; i < dynamicCSSs.length; i++) {
      var dynamicCSS = dynamicCSSs[i];
      dynamicCSS.parentNode.removeChild(dynamicCSS);
    }
  }
};

MVC.prototype.getView = function(id) {
  mvc = this;
  for (var i = 0; i < mvc.views.length; i++) {
    var thisView = mvc.views[i];
    if (thisView.id === id) {
      return thisView;
    }
  }
  return null;
}

MVC.prototype.getModel = function(id) {
  mvc = this;
  for (var i = 0; i < mvc.models.length; i++) {
    var thisModel = mvc.models[i];
    if (thisModel.id === id) {
      return thisModel;
    }
  }
  return null;
}

MVC.prototype.hasView = function(id) {
  mvc = this;
  for (var i = 0; i < mvc.views.length; i++) {
    var thisView = mvc.views[i];
    if (thisView.id === id) {
      return true;
    }
  }
  return false;
}

MVC.prototype.hasModel = function(id) {
  mvc = this;
  for (var i = 0; i < mvc.models.length; i++) {
    var thisModel = mvc.models[i];
    if (thisModel.id === id) {
      return true;
    }
  }
  return false;
}


MVC.prototype.addModel = function(jsfile, callBack) {
  mvc = this;

  /// Options htmlfile, javascript view object
  mvc.getContent(jsfile, function(innerJSFile, innerCallBack) {
    return function(err, result) {
      if (err) {
        throw err;
      }
      var model = eval(result)
      model.jsfile = innerJSFile;
      mvc.models.push(model);
      innerCallBack(model);
    }
  }(jsfile, callBack));
}

MVC.prototype.addView = function(jsfile, callBack) {
  mvc = this;
  console.log("Adding view: " + jsfile);
  /// Dont' use this, use view because its safer
  mvc.getContent(jsfile, function(innerJSFile, innerCallBack) {
    return function(err, result) {
      if (err) {
        throw err;
      }
      var view = eval(result);
      view.jsfile = innerJSFile;
      mvc.views.push(view);
      if (view.html === undefined) {
        innerCallBack(view);
      } else {
        console.log("Loading template " + view.html + " for " + view.id + " view");
        mvc.getContent(view.html, function(innerView, innerCallBack2) {
          return function(err, htmlResult) {
            if (err) {
              throw err;
            }
            /// We got the html, load it into an iFrame so we can clone it when we need to
            var templateIframe = document.createElement("iframe");
            templateIframe.id = innerView.id;
            templateIframe.classList.add("mvc-templateframe");
            templateIframe.style.display = "none";
            document.body.appendChild(templateIframe);

            templateIframe.contentWindow.document.open();
            templateIframe.contentWindow.document.write(htmlResult);
            templateIframe.contentWindow.document.close();

            innerView.frame = templateIframe;

            var cssImports = innerView.frame.contentWindow.document.querySelectorAll(".mvc-csslink");
            if(cssImports.length > 0) {
              view.css = [];
              for(var i = 0; i < cssImports.length; i++) {
                var cssImport = cssImports[i];
                view.css.push(cssImport.cloneNode(true));
                console.log("Found CSS Import: " + cssImport.href);
              }
            }

            innerCallBack2(innerView);
          }
        }(view, innerCallBack));
      }
    }
  }(jsfile, callBack));
}

MVC.prototype.getContent = function(url, callBack) {
  if (XMLHttpRequest) {
    var x = new XMLHttpRequest();
  } else {
    var x = new ActiveXObject("Microsoft.XMLHTTP");
  }
  x.open("GET", url, true);
  x.send();
  x.onreadystatechange = function() {
    if (x.readyState == 4) {
      if (x.status == 200) {
        callBack(null, x.responseText)
      } else {
        callBack("Error MVC Content " + x.status + " :" + url, null);
      }
    }
  }
}

/// View interface
var View = function() {
  view = this;
  view.dom = null;
};

View.prototype.render = function(model, callBack) {
  var view = this;
  view.model = model;

  if(view.frame !== undefined) {

    view.dom = view.frame.contentWindow.document.querySelector(".mvc-template").cloneNode(true);

    /// If the render function is implemented, then call that one
    if (view.engine !== undefined && view.engine === "pure") {
      var newDom = $p(view.dom).render(view.model.data, view.directive);
      /// purejs reutrns an array in case there were multiple selections
      view.dom = newDom[0];
    } else {
      console.log("No auto render engine specified");
    }
  } else {
    view.dom = document.createElement("div");
    view.dom.setAttribute("class", "mvc-template");
    view.dom.setAttribute("id", view.id + "-screen");
  }
  view.postrender(view.model, callBack);
}

var Model = function() {}

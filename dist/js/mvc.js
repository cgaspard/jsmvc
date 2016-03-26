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
};

MVC.prototype.addObserver = function(observer) {
  this.observers.push(observer);
};

MVC.prototype.notify = function(type, data) {
  for (var i = 0; i < this.observers.length; i++) {
    var observer = this.observers[i];
    if (observer.type === undefined) {
      observer.notify(type, data);
    } else if (observer.type === type || observer.type === null || observer.type === "") {
      observer.notify(type, data);
    }
  }
};

MVC.prototype.dataModelUpdated = function(model) {
  /// find the view, and tell it to rerender with
  /// model
  var foundView = mvc.findViewByModel(model);
  foundView.refresh();
};

MVC.prototype.__defineGetter__("isInitDone", function() {
  var mvc = this;
  if (mvc.models.length === mvc.options.models.length &&
    mvc.views.length === mvc.options.views.length) {
    return true;
  }
  return false;
});

MVC.prototype.init = function(controller, callBack) {
  var mvc = this;
  if(controller === undefined) {
    controller = {};
  }
  mvc.controller = controller;

  if (callBack === undefined) {
    callBack = function(args) {
      return function() {
        return args;
      }
    }(arguments);
  }
  var funcArray = [];
  if (mvc.options.views !== undefined && mvc.options.views.length > 0) {
    for (var i = 0; i < mvc.options.views.length; i++) {
      funcArray.push(function(innerMVC, jsfilepath) {
        return function(innerCallBack) {
          innerMVC.addView(jsfilepath, function(mvcInnerCallBack) {
            return function(err, retView) {
              mvcInnerCallBack(err, retView);
            };
          }(innerCallBack));
        }
      }(mvc, mvc.options.views[i]));
    }
  }
  if (mvc.options.models !== undefined && mvc.options.models.length > 0) {
    for (var m = 0; m < mvc.options.models.length; m++) {
      funcArray.push(function(innerMVC, jsfilepath) {
        return function(innerCallBack) {
          innerMVC.addModel(jsfilepath, function(mvcInnerCallBack) {
            return function(err, retModel) {
              mvcInnerCallBack(err, retModel);
            };
          }(innerCallBack));
        }
      }(mvc, mvc.options.models[m]));
    }
  }

  async.parallel(funcArray, function(doneCallback) {
    return function doneParallel(err, result) {
      if(err) {
        app.notify.displayMessageError("Error loading templates");
        console.log(err);
      } else {
        mvc.notify("PreloadComplete", null);
        if(doneCallback !== undefined) {
            doneCallback();
        }

      }
    }
  }(callBack));
};

MVC.prototype.clearModalCSSImports = function() {
  var dynamicCSSs = document.querySelectorAll(".mvc-csslinkmodal");
  if (dynamicCSSs.length > 0) {
    for (var i = 0; i < dynamicCSSs.length; i++) {
      var dynamicCSS = dynamicCSSs[i];
      dynamicCSS.parentNode.removeChild(dynamicCSS);
    }
  }
};
MVC.prototype.clearCSSImports = function() {
  var dynamicCSSs = document.querySelectorAll(".mvc-csslink");
  if (dynamicCSSs.length > 0) {
    for (var i = 0; i < dynamicCSSs.length; i++) {
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
};

MVC.prototype.getModel = function(id) {
  mvc = this;
  for (var i = 0; i < mvc.models.length; i++) {
    var thisModel = mvc.models[i];
    if (thisModel.id === id) {
      return thisModel;
    }
  }
  return null;
};

MVC.prototype.hasView = function(id) {
  mvc = this;
  for (var i = 0; i < mvc.views.length; i++) {
    var thisView = mvc.views[i];
    if (thisView.id === id) {
      return true;
    }
  }
  return false;
};

MVC.prototype.hasModel = function(id) {
  mvc = this;
  for (var i = 0; i < mvc.models.length; i++) {
    var thisModel = mvc.models[i];
    if (thisModel.id === id) {
      return true;
    }
  }
  return false;
};


MVC.prototype.addModel = function(jsfile, callBack) {
  mvc = this;

  /// Options htmlfile, javascript view object
  mvc.getContent(jsfile, true, function(innerJSFile, innerCallBack) {
    return function(err, result) {
      if (err) {
        throw err;
      } else {
        result += "\r\n//# sourceURL=" + document.location.origin + jsfile;
        var model = eval(result);
        model.jsfile = innerJSFile;
        model.mvc = mvc;
        mvc.models.push(model);
        innerCallBack(null, model);
      }
    }
  }(jsfile, callBack));
};

MVC.prototype.clean = function() {
  var mvc = this;
  for(var i = 0; i < mvc.views.length; i++) {
    var view = mvc.views[i];
    view.dom = null;
    view.rendered = false;
  }
  for(var m = 0; m < mvc.models.length; m++) {
    var model = mvc.models[m];
    model.data = {};
    model.loaded = false;
  }
};

MVC.prototype.addView = function(jsfile, callBack) {
  mvc = this;
  console.log("MVC: Adding view " + jsfile);
  /// Dont' use this, use view because its safer
  mvc.getContent(jsfile, true, function(innerJSFile, innerCallBack) {
    return function(err, result) {
      if (err) {
        throw err;
      } else {
        result += "\r\n//# sourceURL=" + document.location.origin + jsfile;
        var view = eval(result);
        view.jsfile = innerJSFile;
        view.mvc = mvc;

        if (view.html === undefined) {
          mvc.views.push(view);
          innerCallBack(null, view);
        } else {
          console.log("MVC: loading template " + view.html + " for " + view.id + " view");
          mvc.getContent(view.html, true, function(innerView, innerCallBack2) {
            return function(err, htmlResult) {
              if (err) {
                throw err;
              } else {
                /// We got the html, load it into an iFrame so we can clone it when we need to
                var templateIframe = document.createElement("iframe");
                templateIframe.id = "mvc-" + innerView.id + "-frame";
                templateIframe.classList.add("mvc-templateframe");
                templateIframe.style.display = "none";
                document.body.appendChild(templateIframe);

                templateIframe.contentWindow.document.open();
                templateIframe.contentWindow.document.write(htmlResult);
                templateIframe.contentWindow.document.close();

                innerView.frame = templateIframe;

                var cssImports = innerView.frame.contentWindow.document.querySelectorAll(".mvc-csslink");
                if (cssImports.length > 0) {
                  view.css = [];
                  for (var i = 0; i < cssImports.length; i++) {
                    var cssImport = cssImports[i];
                    view.css.push(cssImport.cloneNode(true));
                    console.log("MVC: found CSS import: " + cssImport.href);
                  }
                }
                mvc.views.push(innerView);
                innerCallBack2(null, innerView);
              }
            }
          }(view, innerCallBack));
        }
      }
    }
  }(jsfile, callBack));
};

MVC.prototype.require = function(url) {
  var content = this.getContent(url, false);
  content += "\r\n\r\n//# sourceURL=" + document.location.origin + url;
  return eval(content);
};

MVC.prototype.getContent = function(url, async, callBack) {
  if (XMLHttpRequest) {
    var x = new XMLHttpRequest();
  } else {
    var x = new ActiveXObject("Microsoft.XMLHTTP");
  }
  x.open("GET", url + ((/\?/).test(url) ? "&" : "?") + (new Date()).getTime(), async);
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
  if (!async) {
    if (x.status === 200) {
      return x.responseText;
    }
  }
};

/// View interface
var View = function() {
  var view = this;
  view.css = [];
};

View.prototype.refresh = function(force) {

  if (force) {
    this.model.loaded = false;
    this.rendered = false;
  }
  if (typeof(this.model.arguments) === "object") {
    var newargs = [];
    for (var key in this.model.arguments) {
      newargs[key] = this.model.arguments[key];
    }
    this.model.arguments = newargs;
  }
  if (typeof(this.arguments) === "object") {
    var newargs = [];
    for (var key in this.arguments) {
      newargs[key] = this.arguments[key];
    }
    this.arguments = newargs;
  }

  if (!this.model.loaded) {
    this.model.arguments.push(doneReloadingModel);
    Model.prototype.reload.apply(this.model, this.model.arguments);
  } else {
    View.prototype.render.apply(this, this.arguments);
  }

  function doneReloadingModel(innerView) {
    return function() {
      View.prototype.render.apply(innerView, innerView.arguments);
    }
  }(this);

};

View.prototype.render = function(model, callBack) {

  var view = this;
  view.mvc.notify("ViewRenderStart", null);
  view.rendered = false;
  view.arguments = arguments;
  view.model = model
  try {
    if (view.frame !== undefined) {

      view.dom = view.frame.contentWindow.document.querySelector(".mvc-template").cloneNode(true);

      /// If the render function is implemented, then call that one
      if (view.engine !== undefined && view.engine === "pure") {
        var newDom;
        if (view.directive !== undefined) {
          console.log("Rendering using a single directive for pure.js")
          newDom = $p(view.dom).render(view.model.data, view.directive);
          view.dom = newDom[0];
        }
      } else {
        //console.log("No auto render engine specified");
      }
    } else {
      view.dom = document.createElement("div");
      view.dom.setAttribute("class", "mvc-template");
      view.dom.setAttribute("id", "mvc-" + view.id + "-screen");
    }
    if (view.postrender !== undefined) {
      view.postrender(view.model, function(err, retView) {
        retView.rendered = true;
        retView.mvc.notify("ViewRenderDone", retView);
        callBack(null, retView);
      });
    } else {
      view.rendered = true;
      view.mvc.notify("ViewRenderDone", view);
      callBack(null, view);
    }
  } catch (err) {
    view.mvc.notify("ViewRenderDone", view);
    callBack(err);
  }
};

var Model = function() {
  var model = this;
};

Model.prototype.reload = function() {
  if (this.arguments === undefined) {
    throw "Unable to reload model because the model.arguments property needs to be set to load functions parameters";
  } else {
    if(this.reloadfunction !== undefined && this.reloadfunction !== null) {
      this[this.reloadfunction].apply(this, this.arguments);
    } else {
      this.load.apply(this, this.arguments);
    }

  }
};

/// MVC library
var MVC = function(options) {
    mvc = this;

    if(async === undefined) {
        var asyncErr = new Error("async library required for MVC");
        throw asyncErr;
    }
    if($p === undefined) {
        console.log("Warning: pure.js is not loaded, please load if you want to use pure.js template engine");
    }

    mvc.views = [];
    mvc.models = [];
    mvc.observers = [];
    if(typeof(options) === "string") {
        mvc.getContent(options, true, function(err, result) {
            if(err) {
                var optionsError = new Error("MVC bad config file");
            }else {
                options = JSON.parse(result);
                finishConstructor();
            }
        });
    } else {
        finishConstructor();
    }

    function finishConstructor() {
        if (options === undefined || options === null || options === "") {
            options = {};
        }
        mvc.options = options;
        mvc.controller = new MVCController(options, mvc);
        if(mvc.options.routes !== undefined && mvc.options.routes.length > 0) {
            for (var r = 0; r < mvc.options.routes.length; r++) {
                var route = mvc.options.routes[r];
                mvc.controller.addRoute(route.pattern, route.view, route.model, route.alwaysrender, route.function)
            }
        }

        if(mvc.options.autoInit === undefined || mvc.options.autoInit === true) {
            mvc.init(function() {
                if(mvc.options.listenForHashChanges !== undefined && mvc.options.listenForHashChanges === true) {
                    mvc.controller.listenForHashChanges(window);
                }
            });
        } else {
            if(mvc.options.listenForHashChanges !== undefined && mvc.options.listenForHashChanges === true) {
                mvc.controller.listenForHashChanges(window);
            }
        }
    }
};

MVC.prototype.on = function(topic, callBack) {
    this.addObserver({"type": topic, "notify": callBack})
}

MVC.prototype.addObserver = function(observer) {
    this.observers.push(observer);
};

MVC.prototype.emit = function(type, data) {
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

MVC.prototype.init = function(callBack) {
    var mvc = this;

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
            if (err) {
                console.log(err);
            } else {
                mvc.emit("preloadcomplete", null);
                if (doneCallback !== undefined) {
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
    for (var i = 0; i < mvc.views.length; i++) {
        var view = mvc.views[i];
        view.dom = null;
        view.rendered = false;
    }
    for (var m = 0; m < mvc.models.length; m++) {
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
var MVCController = function(controllerOptions, controllerMVC) {
    var routes = [];
    var listeners = [];
    var options = controllerOptions;
    var mvc = controllerMVC;
    /// Events:
    /// hashchanged(hashTag) - detected a hash tag navigation, try to navigate a view if its a registered url
    /// hashchangenoroute(hashTag) - hash naviation didn't match any of the registered mvc routes
    /// routeadded(routeObject) - new route added to controller
    /// showviewstart(viewName) - a request to show a view has began
    /// showviewdone(viewObject) - a view was sucessfully shown
    /// loadmodelstart(modelObject) - a model is going to be loaded with data
    /// loadmodeldone(modelObject) - a model sucessfully loaded
    /// loadmodelerror(errorObject) - a model was not sucessfully loaded
    /// renderviewstart(viewObject) - a view is going to be rendered with a mdoel
    /// renderviewdone(viewObject) - a view was sucessfully rendered
    /// renderviewerror(errorObject) - a view was not sucessfully rendered
    /// displayviewstart(viewObject) - view was rendered, and now we're ready to show it on the screen
    /// displayviewdone(viewObject) - we have sucessfully shown the view on the screen
    /// displayviewerror(errorObject) - error while displaying view
    /// displayviewrollbackstart(viewObject) - when we've had and error displaying, we show the previous one again
    /// displayviewrollbackdone(viewObject) - done rolling back the display to the previous view
    return {

        listenForHashChanges: function(windowObject) {
            var self = this;
            windowObject.addEventListener("hashchange", self.onhashchange, false);
        },

        // @auto-fold here
        invalidateTempViews: function() {
            var self = this;
            for (var i = 0; i < mvc.views.length; i++) {
                mvc.views[i].rendered = false;
                if (mvc.views[i].model !== undefined) {
                    mvc.views[i].model.loaded = false;
                }
            }
        },

        getViewFromHash: function(hash) {
            var self = this;
            var viewName = hash;
            if(hash.indexOf("/") >= 0) {
                viewName = hash.substring(0, hash.indexOf("/"));
            }
            return viewName;
        },

        // @auto-fold here
        importCSS: function(viewObject) {
            var cssList = viewObject.css;
            for (var i = 0; i < cssList.length; i++) {
                var newCSSItem;
                if (viewObject.target !== undefined) {
                    var cssContainer = viewObject.dom.ownerDocument.querySelector(options.cssContainerSelector);
                    newCSSItem = cssContainer.appendChild(cssList[i]);
                } else {
                    newCSSItem = options.cssContainer.appendChild(cssList[i]);
                }
                if (cssList[i].getAttribute("unique")) {
                    cssList.splice(i, 1);
                    newCSSItem.setAttribute("class", "");
                    i--;
                }
            }
        },

        // @auto-fold here
        importModalCSS: function(cssList) {
            for (var i = 0; i < cssList.length; i++) {
                cssList[i].classList.add("mvc-csslinkmodal");
                options.cssContainer.appendChild(cssList[i]);
            }
        },

        // @auto-fold here
        on: function(subject, callBack) {
            listeners.push({"subject": subject, "callBack": callBack});
        },

        // @auto-fold here
        emit: function(subject, data) {
            for(var i = 0; i < listeners.length; i++) {
                var listener = listeners[i];
                if(listener.subject === subject) {
                    listener.callBack(data);
                }
            }
        },

        // @auto-fold here
        onhashchange: function() {
            var self = mvc.controller;
            self.emit("hashchanged", window.location.hash);
            for (var i = 0; i < routes.length; i++) {
                var route = routes[i];
                var routeName = route.pattern;
                if (route.pattern.indexOf("/") >= 0) {
                    routeName = route.pattern.substring(0, route.pattern.indexOf("/"));
                }
                var urlRouteName = window.location.hash;
                if (window.location.hash.indexOf("/") >= 0) {
                    urlRouteName = window.location.hash.substring(0, window.location.hash.indexOf("/"));
                }
                if (routeName.toLowerCase() === urlRouteName.toLowerCase()) {
                    var params = [];
                    var url = window.location.hash.replace(urlRouteName, "");
                    if (window.location.hash.indexOf("/") >= 0) {
                        params = url.split("/");
                        for (var p = 0; p < params.length; p++) {
                            if (params[p] === "") {
                                params.splice(p, 1);
                                p--;
                            }
                        }
                    }
                    self.showView(route.pattern, route.view, route.model, route.alwaysrender, params, route.function)
                    return;
                }
            }
            self.emit("hashchangenoroute", window.location.hash);
        },

        // @auto-fold here
        addRoute: function(pattern, viewName, modelName, alwaysRender, functionName) {
            var self = this;
            var newRoute = {
                "pattern": pattern,
                "view": viewName,
                "model": modelName,
                "alwaysrender": (alwaysRender === undefined ? true : alwaysRender),
                "function": (functionName === undefined ? null : functionName)
            };
            routes.push(newRoute);
            self.emit("routeadded", newRoute);
        },

        // @auto-fold here
        showView: function(pattern, viewName, moduleName, alwaysRender, parameters, moduleLoadFunctionName) {
            var self = this;
            self.emit("showviewstart", viewName);

            /// Get the views we want
            var viewObject = mvc.getView(viewName);
            var modelObject = mvc.getModel(moduleName);
            var viewArgs = arguments;

            if(alwaysRender === undefined) { alwaysRender = true; }
            if(moduleLoadFunctionName === undefined || moduleLoadFunctionName === null || moduleLoadFunctionName === "") { moduleLoadFunctionName = "load"; }

            if (!alwaysRender && viewObject.rendered) {
              self.displayView(viewObject);
              self.emit("showviewdone", viewObject);
              return;
            }

            /// Adding the doneLoadingModule callback
            parameters.push(doneLoadingModule);

            self.emit("loadmodelstart", modelObject);

            /// Loads the model for a view
            modelObject[moduleLoadFunctionName].apply(modelObject, parameters);

            /// Called after the model is loaded
            function doneLoadingModule(err, returnedModel) {
                if (err) {
                    self.emit("loadmodelerror", err);
                } else {
                    self.emit("loadmodeldone", returnedModel);
                    self.emit("renderviewstart", viewObject);
                    viewObject.render(returnedModel, doneRenderingView);
                }
            }

            /// Called after the view is rendered with the model
            function doneRenderingView(err, returnedView) {
                if (err) {
                    self.emit("renderviewerror", err);
                } else {
                    self.emit("renderviewdone", returnedView);
                    self.displayView(returnedView);
                    self.emit("showviewdone", returnedView);
                }
            }
        },

        // @auto-fold here
        displayView: function(viewObject) {
            var self = this;
            self.emit("displayviewstart", viewObject);
            // console.log("displayView");
            if(options.screenContainer === undefined && options.screenContainerSelector !== undefined) {
                options.screenContainer = document.querySelector(options.screenContainerSelector);
            }
            if(options.cssContainer === undefined && options.cssContainerSelector !== undefined) {
                options.cssContainer = document.querySelector(options.cssContainerSelector);
            }

            if(viewObject.beforeShown !== undefined) { viewObject.beforeShown(); }
            try {
                if (viewObject.target === undefined) {
                    mvc.clearCSSImports();
                    var oldHTML = options.screenContainer.innerHTML;
                    options.screenContainer.innerHTML = "";
                    viewObject.dom = options.screenContainer.appendChild(viewObject.dom);
                    self.previousView = self.currentView;
                    self.currentView = viewObject;
                } else {
                    viewObject.target.innerHTML = "";
                    try {
                        viewObject.dom = viewObject.target.appendChild(viewObject.dom);
                    } catch (ex) {
                        viewObject.target.innerHTML = viewObject.dom.outerHTML;
                        viewObject.dom = viewObject.target.childNodes[0];
                    }
                    viewObject.target.view = viewObject;
                }
                if (viewObject.css !== undefined && viewObject.css.length > 0) {
                    self.importCSS(viewObject);
                }
                if (self.previousView !== undefined) {
                    self.previousView.resetDOM();
                }
                // window.view = viewObject;
                self.emit("displayviewdone", viewObject);
                if(viewObject.afterShown !== undefined) { viewObject.afterShown(); }
            } catch (err) {
                self.emit("displayviewerror", err);
                self.currentView = self.previousView;
                if (viewObject.target === undefined) {
                    self.emit("displayviewrollbackstart", self.previousView);
                    if (viewObject.css !== undefined && viewObject.css.length > 0) {
                        self.importCSS(viewObject);
                        viewObject.css = [];
                        viewObject.css[0].replace("csslink", "");
                    }
                    options.screenContainer.innerHTML = "";
                    options.screenContainer.innerHTML = oldHTML;
                    self.emit("displayviewrollbackdone", self.previousView);
                }
            }
            // if (viewObject.target === undefined) {
            //     self.setActivePageButton();
            // }
        },

    };
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

View.prototype.resetDOM = function() {
    this.dom = this.frame.contentWindow.document.querySelector(".mvc-template").cloneNode(true);
}

View.prototype.render = function(model, callBack) {

    var view = this;
    if (view.title !== undefined) {
        document.title = view.title;
    } else {
        document.title = view.id;
    }
    view.mvc.emit("viewrenderstart", null);
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
                retView.mvc.emit("viewrenderdone", retView);
                callBack(null, retView);
            });
        } else {
            view.rendered = true;
            view.mvc.emit("viewrenderdone", view);
            callBack(null, view);
        }
    } catch (err) {
        view.mvc.emit("viewrenderdone", view);
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
        if (this.reloadfunction !== undefined && this.reloadfunction !== null) {
            this[this.reloadfunction].apply(this, this.arguments);
        } else {
            this.load.apply(this, this.arguments);
        }

    }
};

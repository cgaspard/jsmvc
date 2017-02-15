/// The view must have its own id
view.id = "test";

/// Document title will be set to this
view.title = "Test View";

/// The HTML we will render for hte view
//view.html = "<div id=\"blah\">content here</div>";
view.html = "/test/test.htm";

/// This is the MVC route use to display the view, variables will be attached to the view
/// view.route = "#test/variable1/variable2";

/// View is rendered into a DOM object in memory
view.addEventListener("rendered", function () { });

/// View is fully rendered into the document
view.addEventListener("load", function () { });

/// View is about to be removed, and another view displayed
view.addEventListener("unload", function () { });


(function (factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  }
})(function () {
  function compiled(helpers, context, guard, iter, helper) {
    var __escape = helpers.__escape;
    var value = context;
    return "<form type=\"form\">\n<div class=\"mb-3\">\n<label class=\"form-label\" for=\"handle\">[[admin/manage/categories:handle]]</label>\n<input type=\"text\" class=\"form-control\" name=\"handle\" id=\"handle\" placeholder=\"handle@example.org\" />\n</div>\n<div class=\"mb-3\">\n<label class=\"form-label\" for=\"id\">[[admin/manage/categories:id]]</label>\n<input type=\"text\" class=\"form-control\" name=\"id\" id=\"id\" placeholder=\"https://example.org/category/1\" />\n<p class=\"form-text\">[[admin/manage/categories:alert.add-help]]</p>\n</div>\n</form>";
  }

  compiled.blocks = {
    
  };

  return compiled;
})

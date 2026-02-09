
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
    return "<div class=\"flex-fill\">\n<h2 class=\"fw-semibold tracking-tight text-center\">[[notifications:outgoing-link-message, " + 
      __escape(guard((context != null) ? context['title'] : null)) + 
      "]]</h2>\n<div class=\"mx-auto\">\n<div class=\"d-flex flex-column gap-3 justify-content-center text-center\">\n<div class=\"mx-auto p-4 bg-light border rounded\">\n<i class=\"text-secondary fa fa-fw fa-4x fa-external-link\"></i>\n</div>\n<div class=\"col-10 offset-1 col-md-4 offset-4 d-flex flex-column gap-3\">\n<a href=\"" + 
      __escape(guard((context != null) ? context['outgoing'] : null)) + 
      "\" rel=\"nofollow noopener noreferrer\" class=\"btn btn-primary\">[[notifications:continue-to, " + 
      __escape(guard((context != null) ? context['outgoing'] : null)) + 
      "]]</a>\n<a href=\"#\" class=\"btn btn-link\" onclick=\"history.back(); return false;\">[[notifications:return-to, " + 
      __escape(guard((context != null) ? context['title'] : null)) + 
      "]]</a>\n</div>\n</div>\n</div>\n</div>";
  }

  compiled.blocks = {
    
  };

  return compiled;
})

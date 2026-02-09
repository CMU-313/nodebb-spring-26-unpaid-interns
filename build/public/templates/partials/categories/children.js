
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
    return "<ul class=\"list-unstyled category-children row row-cols-1 row-cols-md-2 g-2 my-1 w-100\">\n" + 
      compiled.blocks['./children'](helpers, context, guard, iter, helper) + 
      "\n</ul>";
  }

  compiled.blocks = {
    './children': function children(helpers, context, guard, iter, helper) {
      var __escape = helpers.__escape;
      var value = context;
      return iter(guard((context != null) ? context['children'] : null), function each(key0, index, length, value) {
        var key = key0;
        return "\n" + 
          (guard((context != null && context['children'] != null && context['children'][key0] != null) ? context['children'][key0]['isSection'] : null) ?
            "" :
            "\n<li data-cid=\"" + 
              __escape(guard((context != null && context['children'] != null && context['children'][key0] != null) ? context['children'][key0]['cid'] : null)) + 
              "\" class=\"category-children-item small\">\n<div class=\"d-flex gap-1\">\n<i class=\"fa fa-fw fa-caret-right text-primary\" style=\"line-height: var(--bs-body-line-height);\"></i>\n<a href=\"" + 
              (guard((context != null && context['children'] != null && context['children'][key0] != null) ? context['children'][key0]['link'] : null) ?
                __escape(guard((context != null && context['children'] != null && context['children'][key0] != null) ? context['children'][key0]['link'] : null)) :
                __escape(guard((context != null && context['config'] != null) ? context['config']['relative_path'] : null)) + 
                  "/category/" + 
                  __escape(guard((context != null && context['children'] != null && context['children'][key0] != null) ? context['children'][key0]['slug'] : null))) + 
              "\" class=\"text-reset fw-semibold flex-1\">" + 
              __escape(guard((context != null && context['children'] != null && context['children'][key0] != null) ? context['children'][key0]['name'] : null)) + 
              "</a>\n</div>\n</li>\n") + 
          "\n";
      }, function alt() {
        return "";
      });
    }
  };

  return compiled;
})

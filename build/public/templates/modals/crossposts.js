
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
    return "<div class=\"mb-3\">\n" + 
      (guard((context != null && context['crossposts'] != null) ? context['crossposts']['length'] : null) ?
        "\n<p>[[topic:crossposts.listing]]</p>\n" + 
          compiled.blocks['crossposts'](helpers, context, guard, iter, helper) + 
          "\n" :
        "\n<p>[[topic:crossposts.none]]</p>\n") + 
      "\n</div>";
  }

  compiled.blocks = {
    'crossposts': function crossposts(helpers, context, guard, iter, helper) {
      var __escape = helpers.__escape;
      var value = context;
      return iter(guard((context != null) ? context['crossposts'] : null), function each(key0, index, length, value) {
        var key = key0;
        return "\n" + 
          __escape(helper(context, helpers, 'buildCategoryLabel', [guard((context != null && context['crossposts'] != null && context['crossposts'][key0] != null) ? context['crossposts'][key0]['category'] : null), "a", "border"])) + 
          "\n";
      }, function alt() {
        return "";
      });
    }
  };

  return compiled;
})

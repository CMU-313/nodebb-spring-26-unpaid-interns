
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
    return compiled.blocks['thumbs'](helpers, context, guard, iter, helper) + 
      (helper(context, helpers, 'greaterthan', [guard((context != null && context['thumbs'] != null) ? context['thumbs']['length'] : null), "4"]) ?
        "\n<button component=\"topic/thumb/list/expand\" class=\"btn btn-light fw-semibold\" style=\"width:auto; max-width: 5.33rem; height: 3.33rem; object-fit: contain;\">+" + 
          __escape(helper(context, helpers, 'increment', [guard((context != null && context['thumbs'] != null) ? context['thumbs']['length'] : null), "-3"])) + 
          "</button>\n" :
        "");
  }

  compiled.blocks = {
    'thumbs': function thumbs(helpers, context, guard, iter, helper) {
      var __escape = helpers.__escape;
      var value = context;
      return iter(guard((context != null) ? context['thumbs'] : null), function each(key0, index, length, value) {
        var key = key0;
        return "\n<a class=\"d-inline-block\" href=\"" + 
          __escape(guard((context != null && context['thumbs'] != null && context['thumbs'][key0] != null) ? context['thumbs'][key0]['url'] : null)) + 
          "\">\n<img class=\"rounded-1 bg-light\" style=\"width:auto; max-width: 5.33rem; height: 3.33rem; object-fit: contain;\" src=\"" + 
          __escape(guard((context != null && context['thumbs'] != null && context['thumbs'][key0] != null) ? context['thumbs'][key0]['url'] : null)) + 
          "\" />\n</a>\n";
      }, function alt() {
        return "";
      });
    }
  };

  return compiled;
})

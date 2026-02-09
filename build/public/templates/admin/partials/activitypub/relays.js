
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
    return "<p>[[admin/settings/activitypub:relays.warning]]</p>\n<p>[[admin/settings/activitypub:relays.litepub]]</p>\n<hr />\n<form role=\"form\">\n<div class=\"mb-3\">\n<label class=\"form-label\" for=\"url\">Relay URL</label>\n<input type=\"text\" id=\"url\" name=\"url\" title=\"Relay URL\" class=\"form-control\" placeholder=\"https://example.org/actor\">\n</div>\n</form>";
  }

  compiled.blocks = {
    
  };

  return compiled;
})

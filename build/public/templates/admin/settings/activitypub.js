
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
    return "<div class=\"acp-page-container\">\n<div component=\"settings/main/header\" class=\"row border-bottom py-2 m-0 sticky-top acp-page-main-header align-items-center\">\n<div class=\"col-12 col-md-8 px-0 mb-1 mb-md-0\">\n<h4 class=\"fw-bold tracking-tight mb-0\">" + 
      __escape(guard((context != null) ? context['title'] : null)) + 
      "</h4>\n</div>\n<div class=\"col-12 col-md-4 px-0 px-md-3\">\n<button id=\"save\" class=\"btn btn-primary btn-sm fw-semibold ff-secondary w-100 text-center text-nowrap\">[[admin/admin:save-changes]]</button>\n</div>\n</div>\n<p class=\"lead\">[[admin/settings/activitypub:intro-lead]]</p>\n<p>[[admin/settings/activitypub:intro-body]]</p>\n<hr />\n<div class=\"row settings m-0\">\n<div class=\"col-sm-2 col-12 settings-header\">[[admin/settings/activitypub:general]]</div>\n<div class=\"col-sm-10 col-12\">\n<form>\n<div class=\"form-check form-switch mb-3\">\n<input class=\"form-check-input\" type=\"checkbox\" data-field=\"activitypubEnabled\">\n<label class=\"form-check-label\">[[admin/settings/activitypub:enabled]]</label>\n<p class=\"form-text\">[[admin/settings/activitypub:enabled-help]]</p>\n</div>\n<div class=\"form-check form-switch mb-3\">\n<input class=\"form-check-input\" type=\"checkbox\" data-field=\"activitypubAllowLoopback\">\n<label class=\"form-check-label\">[[admin/settings/activitypub:allowLoopback]]</label>\n<p class=\"form-text\">[[admin/settings/activitypub:allowLoopback-help]]</p>\n</div>\n</form>\n</div>\n</div>\n<div class=\"row settings m-0\">\n<div class=\"col-sm-2 col-12 settings-header\">[[admin/settings/activitypub:probe]]</div>\n<div class=\"col-sm-10 col-12\">\n<form>\n<div class=\"form-check form-switch mb-3\">\n<input class=\"form-check-input\" type=\"checkbox\" data-field=\"activitypubProbe\">\n<label class=\"form-check-label\">[[admin/settings/activitypub:probe-enabled]]</label>\n<p class=\"form-text\">[[admin/settings/activitypub:probe-enabled-help]]</p>\n</div>\n<div class=\"mb-3\">\n<label class=\"form-label\" for=\"activitypubProbeTimeout\">[[admin/settings/activitypub:probe-timeout]]</label>\n<input type=\"number\" id=\"activitypubProbeTimeout\" name=\"activitypubProbeTimeout\" data-field=\"activitypubProbeTimeout\" title=\"[[admin/settings/activitypub:probe-timeout]]\" class=\"form-control\" />\n<div class=\"form-text\">\n[[admin/settings/activitypub:probe-timeout-help]]\n</div>\n</div>\n</form>\n</div>\n</div>\n<div class=\"row settings m-0\">\n<div class=\"col-sm-2 col-12 settings-header\">[[admin/settings/activitypub:rules]]</div>\n<div class=\"col-sm-10 col-12\">\n<div class=\"mb-3\">\n<p>[[admin/settings/activitypub:rules-intro]]</p>\n<table class=\"table table-striped\" id=\"rules\">\n<thead>\n<th>[[admin/settings/activitypub:rules.type]]</th>\n<th>[[admin/settings/activitypub:rules.value]]</th>\n<th>[[admin/settings/activitypub:rules.cid]]</th>\n<th></th>\n</thead>\n<tbody>\n" + 
      compiled.blocks['rules'](helpers, context, guard, iter, helper) + 
      "\n</tbody>\n<tfoot>\n<tr>\n<td colspan=\"3\">\n<button class=\"btn btn-sm btn-primary\" data-action=\"rules.add\">[[admin/settings/activitypub:rules.add]]</button>\n</td>\n</tr>\n</tfoot>\n</table>\n</div>\n</div>\n</div>\n<div class=\"row settings m-0\">\n<div class=\"col-sm-2 col-12 settings-header\">[[admin/settings/activitypub:relays]]</div>\n<div class=\"col-sm-10 col-12\">\n<p>[[admin/settings/activitypub:relays.intro]]</p>\n<p class=\"text-warning\">[[admin/settings/activitypub:relays.warning]]</p>\n<div class=\"mb-3\">\n<table class=\"table table-striped\" id=\"relays\">\n<thead>\n<th>[[admin/settings/activitypub:relays.relay]]</th>\n<th>[[admin/settings/activitypub:relays.state]]</th>\n<th></th>\n</thead>\n<tbody>\n" + 
      compiled.blocks['relays'](helpers, context, guard, iter, helper) + 
      "\n</tbody>\n<tfoot>\n<tr>\n<td colspan=\"3\">\n<button class=\"btn btn-sm btn-primary\" data-action=\"relays.add\">[[admin/settings/activitypub:relays.add]]</button>\n</td>\n</tr>\n</tfoot>\n</table>\n</div>\n</div>\n</div>\n<div class=\"row settings m-0\">\n<div class=\"col-sm-2 col-12 settings-header\">[[admin/settings/activitypub:pruning]]</div>\n<div class=\"col-sm-10 col-12\">\n<form>\n<div class=\"mb-3\">\n<label class=\"form-label\" for=\"activitypubContentPruneDays\">[[admin/settings/activitypub:content-pruning]]</label>\n<input type=\"number\" id=\"activitypubContentPruneDays\" name=\"activitypubContentPruneDays\" data-field=\"activitypubContentPruneDays\" title=\"[[admin/settings/activitypub:content-pruning]]\" class=\"form-control\" />\n<div class=\"form-text\">\n[[admin/settings/activitypub:content-pruning-help]]\n</div>\n</div>\n<div class=\"mb-3\">\n<label class=\"form-label\" for=\"activitypubUserPruneDays\">[[admin/settings/activitypub:user-pruning]]</label>\n<input type=\"number\" id=\"activitypubUserPruneDays\" name=\"activitypubUserPruneDays\" data-field=\"activitypubUserPruneDays\" title=\"[[admin/settings/activitypub:user-pruning]]\" class=\"form-control\" />\n<div class=\"form-text\">\n[[admin/settings/activitypub:user-pruning-help]]\n</div>\n</div>\n</form>\n</div>\n</div>\n<div class=\"row settings m-0\">\n<div class=\"col-sm-2 col-12 settings-header\">[[admin/settings/activitypub:server-filtering]]</div>\n<div class=\"col-sm-10 col-12\">\n<form>\n<div class=\"mb-3\">\n<p>[[admin/settings/activitypub:server.filter-help]]</p>\n<p>[[admin/settings/activitypub:server.filter-help-hostname]]</p>\n<p>[[admin/settings/activitypub:count, " + 
      __escape(guard((context != null) ? context['instanceCount'] : null)) + 
      "]]</p>\n<label for=\"activitypubFilterList\" class=\"form-label\">Filtering list</label>\n<textarea class=\"form-control\" id=\"activitypubFilterList\" data-field=\"activitypubFilterList\" rows=\"10\"></textarea>\n</div>\n<div class=\"form-check form-switch mb-3\">\n<input class=\"form-check-input\" type=\"checkbox\" id=\"activitypubFilter\" data-field=\"activitypubFilter\" />\n<label class=\"form-check-label\" for=\"activitypubFilter\">[[admin/settings/activitypub:server.filter-allow-list]]</label>\n</div>\n</form>\n</div>\n</div>\n</div>";
  }

  compiled.blocks = {
    'rules': function rules(helpers, context, guard, iter, helper) {
      var __escape = helpers.__escape;
      var value = context;
      return iter(guard((context != null) ? context['rules'] : null), function each(key0, index, length, value) {
        var key = key0;
        return "\n<tr data-rid=\"" + 
          __escape(guard((context != null && context['rules'] != null && context['rules'][key0] != null) ? context['rules'][key0]['rid'] : null)) + 
          "\">\n<td>" + 
          __escape(guard((context != null && context['rules'] != null && context['rules'][key0] != null) ? context['rules'][key0]['type'] : null)) + 
          "</td>\n<td>" + 
          __escape(guard((context != null && context['rules'] != null && context['rules'][key0] != null) ? context['rules'][key0]['value'] : null)) + 
          "</td>\n<td>" + 
          __escape(guard((context != null && context['rules'] != null && context['rules'][key0] != null) ? context['rules'][key0]['cid'] : null)) + 
          "</td>\n<td><a href=\"#\" data-action=\"rules.delete\"><i class=\"fa fa-trash link-danger\"></i></a></td>\n</tr>\n";
      }, function alt() {
        return "";
      });
    },
    'relays': function relays(helpers, context, guard, iter, helper) {
      var __escape = helpers.__escape;
      var value = context;
      return iter(guard((context != null) ? context['relays'] : null), function each(key0, index, length, value) {
        var key = key0;
        return "\n<tr data-url=\"" + 
          __escape(guard((context != null && context['relays'] != null && context['relays'][key0] != null) ? context['relays'][key0]['url'] : null)) + 
          "\">\n<td>" + 
          __escape(guard((context != null && context['relays'] != null && context['relays'][key0] != null) ? context['relays'][key0]['url'] : null)) + 
          "</td>\n<td>" + 
          __escape(guard((context != null && context['relays'] != null && context['relays'][key0] != null) ? context['relays'][key0]['label'] : null)) + 
          "</td>\n<td><a href=\"#\" data-action=\"relays.remove\"><i class=\"fa fa-trash link-danger\"></i></a></td>\n</tr>\n";
      }, function alt() {
        return "";
      });
    }
  };

  return compiled;
})


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
      "</h4>\n</div>\n<div class=\"col-12 col-md-4 px-0 px-md-3\">\n<button id=\"save\" class=\"btn btn-primary btn-sm fw-semibold ff-secondary w-100 text-center text-nowrap\">[[admin/admin:save-changes]]</button>\n</div>\n</div>\n<div class=\"row m-0\">\n<div id=\"spy-container\" class=\"col-12 px-0 mb-4\" tabindex=\"0\">\n<div class=\"card\">\n<div class=\"card-header\">DB Search</div>\n<div class=\"card-body row\">\n<div class=\"col-6\">\n<div class=\"mb-3\">\n<div class=\"alert alert-info\">\nTopics Indexed: <strong id=\"topics-indexed\">" + 
      __escape(guard((context != null) ? context['topicsIndexed'] : null)) + 
      "</strong> <i class=\"fa fa-circle-question\" title=\"Deleted topics are not indexed\" data-bs-toggle=\"tooltip\"></i>\n</div>\n<div class=\"progress " + 
      (guard((context != null) ? context['working'] : null) ?
        "" :
        "invisible") + 
      "\" style=\"height:24px;\">\n<div class=\"topic-progress progress-bar\" role=\"progressbar\" aria-valuenow=\"0\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width:" + 
      __escape(guard((context != null && context['progressData'] != null) ? context['progressData']['topicsPercent'] : null)) + 
      "%;min-width: 2em;\">" + 
      __escape(guard((context != null && context['progressData'] != null) ? context['progressData']['topicsPercent'] : null)) + 
      "%</div>\n</div>\n</div>\n<div class=\"mb-3\">\n<div class=\"alert alert-info\">\nPosts Indexed: <strong id=\"posts-indexed\">" + 
      __escape(guard((context != null) ? context['postsIndexed'] : null)) + 
      "</strong> <i class=\"fa fa-circle-question\" title=\"Deleted posts are not indexed\" data-bs-toggle=\"tooltip\"></i>\n</div>\n<div class=\"progress " + 
      (guard((context != null) ? context['working'] : null) ?
        "" :
        "invisible") + 
      "\" style=\"height:24px;\">\n<div class=\"post-progress progress-bar\" role=\"progressbar\" aria-valuenow=\"0\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width:" + 
      __escape(guard((context != null && context['progressData'] != null) ? context['progressData']['postsPercent'] : null)) + 
      "%;min-width: 2em;\">" + 
      __escape(guard((context != null && context['progressData'] != null) ? context['progressData']['postsPercent'] : null)) + 
      "%</div>\n</div>\n</div>\n<div class=\"mb-3\">\n<div class=\"alert alert-info\">\nMessages Indexed: <strong id=\"messages-indexed\">" + 
      __escape(guard((context != null) ? context['messagesIndexed'] : null)) + 
      "</strong> <i class=\"fa fa-circle-question\" title=\"Deleted messages are not indexed\" data-bs-toggle=\"tooltip\"></i>\n</div>\n<div class=\"progress " + 
      (guard((context != null) ? context['working'] : null) ?
        "" :
        "invisible") + 
      "\" style=\"height:24px;\">\n<div class=\"message-progress progress-bar\" role=\"progressbar\" aria-valuenow=\"0\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width:" + 
      __escape(guard((context != null && context['progressData'] != null) ? context['progressData']['messagesPercent'] : null)) + 
      "%;min-width: 2em;\">" + 
      __escape(guard((context != null && context['progressData'] != null) ? context['progressData']['messagesPercent'] : null)) + 
      "%</div>\n</div>\n</div>\n<button class=\"btn btn-warning\" id=\"reindex\" " + 
      (guard((context != null) ? context['working'] : null) ?
        "disabled" :
        "") + 
      ">Re Index</button>\n<button class=\"btn btn-danger\" id=\"clear-index\">Clear Index</button>\n<span id=\"work-in-progress\" class=\"" + 
      (guard((context != null) ? context['working'] : null) ?
        "" :
        "hidden") + 
      "\">\n<i class=\"fa fa-gear fa-spin\"></i> Working...\n</span>\n<hr/>\n" + 
      (guard((context != null) ? context['languageSupported'] : null) ?
        "\n<div class=\"mb-3\">\n<label class=\"form-label\">Index Language</label>\n<select class=\"form-select\" id=\"indexLanguage\">\n" + 
          compiled.blocks['languages'](helpers, context, guard, iter, helper) + 
          "\n</select>\n</div>\n<button class=\"btn btn-primary\" id=\"changeLanguage\">Change Language</button>\n<hr/>\n" :
        "") + 
      "\n<div class=\"mb-3\">\n<label class=\"form-label\">Topic Limit</label>\n<input id=\"topicLimit\" type=\"text\" class=\"form-control\" placeholder=\"Number of topics to return\" value=\"" + 
      __escape(guard((context != null) ? context['topicLimit'] : null)) + 
      "\">\n</div>\n<div class=\"mb-3\">\n<label class=\"form-label\">Post Limit</label>\n<input id=\"postLimit\" type=\"text\" class=\"form-control\" placeholder=\"Number of posts to return\" value=\"" + 
      __escape(guard((context != null) ? context['postLimit'] : null)) + 
      "\">\n</div>\n</div>\n<div class=\"col-6\">\n<div class=\"post-search-item\">\n<label class=\"form-label\">Select categories to exclude from indexing</label>\n<select multiple class=\"form-select\" id=\"exclude-categories\" size=\"30\">\n" + 
      compiled.blocks['allCategories'](helpers, context, guard, iter, helper) + 
      "\n</select>\n</div>\n</div>\n</div>\n</div>\n</div>\n</div>\n</div>";
  }

  compiled.blocks = {
    'languages': function languages(helpers, context, guard, iter, helper) {
      var __escape = helpers.__escape;
      var value = context;
      return iter(guard((context != null) ? context['languages'] : null), function each(key0, index, length, value) {
        var key = key0;
        return "\n<option value=\"" + 
          __escape(guard((context != null && context['languages'] != null && context['languages'][key0] != null) ? context['languages'][key0]['value'] : null)) + 
          "\" " + 
          (guard((context != null && context['languages'] != null && context['languages'][key0] != null) ? context['languages'][key0]['selected'] : null) ?
            "selected" :
            "") + 
          ">" + 
          __escape(guard((context != null && context['languages'] != null && context['languages'][key0] != null) ? context['languages'][key0]['name'] : null)) + 
          "</option>\n";
      }, function alt() {
        return "";
      });
    },
    'allCategories': function allCategories(helpers, context, guard, iter, helper) {
      var __escape = helpers.__escape;
      var value = context;
      return iter(guard((context != null) ? context['allCategories'] : null), function each(key0, index, length, value) {
        var key = key0;
        return "\n<option value=\"" + 
          __escape(guard((context != null && context['allCategories'] != null && context['allCategories'][key0] != null) ? context['allCategories'][key0]['value'] : null)) + 
          "\" " + 
          (guard((context != null && context['allCategories'] != null && context['allCategories'][key0] != null) ? context['allCategories'][key0]['selected'] : null) ?
            "selected" :
            "") + 
          ">" + 
          __escape(guard((context != null && context['allCategories'] != null && context['allCategories'][key0] != null) ? context['allCategories'][key0]['text'] : null)) + 
          "</option>\n";
      }, function alt() {
        return "";
      });
    }
  };

  return compiled;
})

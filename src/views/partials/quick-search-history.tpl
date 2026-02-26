<div class="d-flex align-items-center justify-content-between px-2 pb-2 border-bottom">
	<span class="text-xs text-muted text-uppercase fw-semibold">[[search:recent-searches]]</span>
	{{{ if searches.length }}}
	<button type="button" component="search/history/clear" class="btn btn-link btn-sm p-0 text-decoration-none">[[search:clear-history]]</button>
	{{{ end }}}
</div>

{{{ if searches.length }}}
<ul id="quick-search-results" class="quick-search-results list-unstyled mb-0 mt-1 p-0 pe-1 overflow-auto overscroll-behavior-contain ff-base ghost-scrollbar" style="max-width: {dropdown.maxWidth}; max-height: {dropdown.maxHeight};">
	{{{ each searches }}}
	<li class="d-flex flex-column search-history-item">
		<a href="#" component="search/history/item" data-query="{./query}" class="btn btn-ghost btn-sm ff-secondary rounded-1 text-start text-reset d-block text-truncate px-2 py-1 search-history-link">{./query}</a>
	</li>
	{{{ if !@last }}}
	<li role="separator" class="dropdown-divider"></li>
	{{{ end }}}
	{{{ end }}}
</ul>
{{{ else }}}
<div class="text-center text-muted text-xs py-3">[[search:no-search-history]]</div>
{{{ end }}}

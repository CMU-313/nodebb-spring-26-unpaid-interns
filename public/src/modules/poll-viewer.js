'use strict';

define('modules/poll-viewer', ['components', 'translator', 'benchpress', 'api'], function (components, translator, Benchpress, api) {
    const PollViewer = {};

    PollViewer.init = function () {
        $(window).on('action:topic.loaded', loadPolls);
        $(window).on('action:posts.loaded', loadPolls);
    };

    function loadPolls(ev, data) {
        const posts = data.posts ? data.posts : data.post ? [data.post] : [];

        if (posts.length === 0 && ajaxify.data.posts) {
            // internal page load
            processPage();
            return;
        }

        posts.forEach(post => {
            processPost(post.pid);
        });
    }

    function processPage() {
        $('[component="post"]').each(function () {
            const pid = $(this).attr('data-pid');
            processPost(pid);
        });
    }

    function processPost(pid) {
        const postContentEl = $(`[component="post"][data-pid="${pid}"] [component="post/content"]`);
        if (!postContentEl.length) return;

        const content = postContentEl.html();
        const pollRegex = /\[poll:(.*?)\]/g;
        const match = pollRegex.exec(content);

        if (match) {
            const pollId = match[1];
            // Sanitize pollId for use in DOM ID (replace ':' with '-')
            const safePollId = pollId.replace(/[:.]/g, '-');

            // Fix: Poll ID with colon causes jQuery error if not escaped or sanitized. 
            // Using safePollId for the DOM element ID.

            // Replace tag with placeholder if not already there
            if (postContentEl.find(`#poll-${safePollId}`).length === 0) {
                const newContent = content.replace(match[0], `<div id="poll-${safePollId}" class="poll-container">Loading Poll...</div>`);
                postContentEl.html(newContent);
                renderPoll(pollId, safePollId);
            }
        }
    }

    function renderPoll(pollId, safePollId) {
        api.get(`/api/polls/${pollId}`, {}).then((poll) => {
            const container = $(`#poll-${safePollId}`);
            if (!container.length) return;

            let html = `
				<div class="card mb-3">
					<div class="card-header">
						<i class="fa fa-bar-chart"></i> ${poll.title}
					</div>
					<div class="card-body">
						<h5 class="card-title">${poll.question}</h5>
						<ul class="list-group list-group-flush">
			`;

            poll.options.forEach(option => {
                html += `
					<li class="list-group-item d-flex justify-content-between align-items-center">
						${option.text}
						<span class="badge bg-primary rounded-pill">${option.votes || 0}</span>
					</li>
				`;
            });

            html += `
						</ul>
					</div>
				</div>
			`;

            container.html(html);
        }).catch((err) => {
            console.error('Error loading poll:', err);
            $(`#poll-${safePollId}`).html(`<div class="alert alert-danger">Error loading poll: ${err.message}</div>`);
        });
    }

    return PollViewer;
});

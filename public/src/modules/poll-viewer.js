'use strict';

define('modules/poll-viewer', ['components', 'translator', 'benchpress', 'api', 'alerts'], function (components, translator, Benchpress, api, alerts) {
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
				<div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;">
					<h3>${poll.title}</h3>
					<p><b>${poll.question}</b></p>
					<ul>
			`;

			if (poll.hasVoted || !app.user.uid) {
				poll.options.forEach(option => {
					html += `
						<li>
							${option.text}
							<span>(${option.votes || 0} votes)</span>
						</li>
					`;
				});
			} else {
				html += `<form id="vote-form-${safePollId}">`;
				poll.options.forEach(option => {
					html += `
						<li style="list-style-type: none;">
							<label>
								<input type="radio" name="poll-option-${safePollId}" value="${option.optionId}">
								${option.text}
							</label>
						</li>
					`;
				});
				html += `
						<li style="list-style-type: none;">
							<button type="button" id="vote-btn-${safePollId}" style="margin-top: 10px;">Vote</button>
						</li>
					</form>
				`;
			}

			html += `
					</ul>
				</div>
			`;

			container.html(html);

			if (!poll.hasVoted && app.user.uid) {
				$(`#vote-btn-${safePollId}`).on('click', function () {
					const selectedOption = $(`input[name="poll-option-${safePollId}"]:checked`).val();
					if (selectedOption === undefined) {
						alerts.error('Please select an option to vote.');
						return;
					}

					api.post(`/api/polls/${pollId}/vote`, { optionId: selectedOption }).then(() => {
						alerts.success('Vote cast successfully!');
						renderPoll(pollId, safePollId); // Re-render to show results
					}).catch(err => {
						alerts.error(err.message || 'Failed to cast vote.');
					});
				});
			}
		}).catch((err) => {
			console.error('Error loading poll:', err);
			$(`#poll-${safePollId}`).html(`<div class="alert alert-danger">Error loading poll: ${err.message}</div>`);
		});
	}

	return PollViewer;
});

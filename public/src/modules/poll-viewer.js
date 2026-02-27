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

	function renderPoll(pollId, safePollId, forceVotingMode = false) {
		api.get(`/api/polls/${pollId}`, {}).then((poll) => {
			const container = $(`#poll-${safePollId}`);
			if (!container.length) return;

			let html = `
				<div class="card mb-3">
					<div class="card-header d-flex justify-content-between align-items-center">
						<span><i class="fa fa-bar-chart"></i> ${poll.title}</span>
						${poll.isClosed ? '<span class="badge bg-secondary">Closed</span>' : ''}
					</div>
					<div class="card-body">
						<h5 class="card-title">${poll.question}</h5>
						<ul class="list-group list-group-flush">
			`;

			const isVoting = forceVotingMode || (!poll.hasVoted && !poll.isCreator && app.user.uid > 0 && !poll.isClosed);

			if (!isVoting) {
				poll.options.forEach(option => {
					if (poll.isCreator) {
						html += `
							<li class="list-group-item">
								<div class="d-flex justify-content-between mb-1">
									<span>${option.text}</span>
									<span>${option.votes || 0} vote${option.votes !== 1 ? 's' : ''} (${option.percentage}%)</span>
								</div>
								<div class="progress" style="height: 8px;">
									<div class="progress-bar" role="progressbar" style="width: ${option.percentage}%" aria-valuenow="${option.percentage}" aria-valuemin="0" aria-valuemax="100"></div>
								</div>
							</li>
						`;
					} else {
						html += `
							<li class="list-group-item d-flex justify-content-between align-items-center">
								${option.text}
								<span class="badge bg-primary rounded-pill">${option.votes || 0}</span>
							</li>
						`;
					}
				});

				if (poll.hasVoted && app.user.uid > 0 && !poll.isClosed && !poll.isCreator) {
					html += `
						<li class="list-group-item">
							<button type="button" class="btn btn-secondary btn-sm mt-2" id="change-vote-btn-${safePollId}">Change Vote</button>
						</li>
					`;
				}

				if (poll.isCreator && !poll.isClosed) {
					html += `
						<li class="list-group-item">
							<button type="button" class="btn btn-danger btn-sm mt-2" id="close-poll-btn-${safePollId}">Close Poll</button>
						</li>
					`;
				}
			} else {
				html += `<form id="vote-form-${safePollId}">`;
				poll.options.forEach(option => {
					html += `
						<li class="list-group-item">
							<div class="form-check">
								<input class="form-check-input" type="radio" name="poll-option-${safePollId}" id="option-${safePollId}-${option.optionId}" value="${option.optionId}">
								<label class="form-check-label" for="option-${safePollId}-${option.optionId}">
									${option.text}
								</label>
							</div>
						</li>
					`;
				});
				html += `
						<li class="list-group-item">
							<button type="button" class="btn btn-primary btn-sm mt-2" id="vote-btn-${safePollId}">Vote</button>
						</li>
					</form>
				`;
			}

			html += `
						</ul>
					</div>
				</div>
			`;

			container.html(html);

			if (isVoting) {
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
			} else if (poll.hasVoted && app.user.uid > 0 && !poll.isClosed && !poll.isCreator) {
				$(`#change-vote-btn-${safePollId}`).on('click', function () {
					renderPoll(pollId, safePollId, true);
				});
			}

			if (poll.isCreator && !poll.isClosed) {
				$(`#close-poll-btn-${safePollId}`).on('click', function () {
					api.post(`/api/polls/${pollId}/close`, {}).then(() => {
						alerts.success('Poll closed.');
						renderPoll(pollId, safePollId);
					}).catch(err => {
						alerts.error(err.message || 'Failed to close poll.');
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

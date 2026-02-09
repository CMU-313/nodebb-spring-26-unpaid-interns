'use strict';

define('modules/poll-creator', ['components', 'translator', 'benchpress', 'api', 'bootbox', 'alerts'], function (components, translator, Benchpress, api, bootbox, alerts) {
	const PollCreator = {};

	PollCreator.init = function () {
		console.log('[PollCreator] Init called');
		$(window).on('action:composer.loaded', addPollButton);
	};

	function addPollButton(ev, data) {
		console.log('[PollCreator] action:composer.loaded fired', data);

		if (!data) {
			console.error('[PollCreator] data object is undefined');
			return;
		}

		const postContainer = data.postContainer;
		if (!postContainer) {
			console.error('[PollCreator] postContainer is undefined');
			return;
		}

		const formattingBar = postContainer.find('.formatting-bar');
		console.log('[PollCreator] formattingBar found:', formattingBar.length);

		if (formattingBar.find('[data-format="poll"]').length) {
			console.log('[PollCreator] Poll button already exists');
			return;
		}

		const pollBtn = $('<li title="Create Poll"><button data-format="poll" class="btn btn-sm btn-link text-reset" aria-label="Create Poll"><i class="fa fa-bar-chart"></i></button></li>');

		// Insert before the upload button if possible, otherwise append
		const uploadBtn = formattingBar.find('[data-format="upload"]').closest('li');
		if (uploadBtn.length) {
			console.log('[PollCreator] Inserting before upload button');
			uploadBtn.before(pollBtn);
		} else {
			console.log('[PollCreator] Appending to formatting bar list');
			formattingBar.find('ul').append(pollBtn);
		}

		pollBtn.on('click', function (e) {
			e.preventDefault();
			// action:composer.loaded data has post_uuid directly, or fallback to attr
			const post_uuid = data.post_uuid || postContainer.attr('data-uuid');
			console.log('[PollCreator] Launching poll creator for post:', post_uuid);
			launchPollCreator(post_uuid);
		});
	}

	function launchPollCreator(post_uuid) {
		bootbox.dialog({
			title: 'Create a Poll',
			message: '<form id="poll-creator-form">' +
                '<div class="mb-3">' +
                '<label for="poll-title" class="form-label">Poll Title</label>' +
                '<input type="text" class="form-control" id="poll-title" required>' +
                '</div>' +
                '<div class="mb-3">' +
                '<label for="poll-question" class="form-label">Question</label>' +
                '<input type="text" class="form-control" id="poll-question" required>' +
                '</div>' +
                '<div class="mb-3">' +
                '<label for="poll-options" class="form-label">Options (one per line)</label>' +
                '<textarea class="form-control" id="poll-options" rows="5" required></textarea>' +
                '</div>' +
                '</form>',
			buttons: {
				cancel: {
					label: 'Cancel',
					className: 'btn-secondary',
				},
				create: {
					label: 'Create Poll',
					className: 'btn-primary',
					callback: function () {
						const title = $('#poll-title').val();
						const question = $('#poll-question').val();
						const optionsText = $('#poll-options').val();
						const options = optionsText.split('\n').filter(o => o.trim().length > 0);

						if (!title || !question || options.length < 2) {
							alerts.error('Please provide a title, question, and at least two options.');
							return false;
						}

						api.post('/api/polls', {
							title: title,
							question: question,
							options: options,
						}).then((poll) => {
							const pollTag = `[poll:${poll.pollId}]`;
							const composerArea = $(`[data-uuid="${post_uuid}"] .write`);
							const currentContent = composerArea.val();
							composerArea.val(currentContent + (currentContent.length ? '\n' : '') + pollTag);
							composerArea.trigger('input'); // Trigger preview update

							alerts.success('Poll has been successfully created and added to the post.');
						}).catch((err) => {
							alerts.error(err.message || 'Failed to create poll.');
						});
					},
				},
			},
		});
	}

	return PollCreator;
});

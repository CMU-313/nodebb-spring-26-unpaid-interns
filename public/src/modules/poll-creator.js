'use strict';

define('modules/poll-creator', ['components', 'translator', 'benchpress', 'api', 'bootbox'], function (components, translator, Benchpress, api, bootbox) {
    const PollCreator = {};

    PollCreator.init = function () {
        $(window).on('action:composer.enhanced', addPollButton);
    };

    function addPollButton(ev, data) {
        const formattingBar = data.formatting;
        if (formattingBar.find('[data-format="poll"]').length) {
            return;
        }

        const pollBtn = $('<li title="Create Poll"><button data-format="poll" class="btn btn-sm btn-link text-reset" aria-label="Create Poll"><i class="fa fa-bar-chart"></i></button></li>');

        // Insert before the upload button if possible, otherwise append
        const uploadBtn = formattingBar.find('[data-format="upload"]').closest('li');
        if (uploadBtn.length) {
            uploadBtn.before(pollBtn);
        } else {
            formattingBar.find('ul').append(pollBtn);
        }

        pollBtn.on('click', function (e) {
            e.preventDefault();
            launchPollCreator(data.post_uuid);
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
                            app.alert({
                                type: 'danger',
                                alert_id: 'poll-creation-error',
                                title: 'Invalid Poll',
                                message: 'Please provide a title, question, and at least two options.',
                            });
                            return false;
                        }

                        api.post('/polls', {
                            title: title,
                            question: question,
                            options: options,
                        }).then((poll) => {
                            const pollTag = `[poll:${poll.pollId}]`;
                            const composerArea = $(`[data-uuid="${post_uuid}"] .write`);
                            const currentContent = composerArea.val();
                            composerArea.val(currentContent + (currentContent.length ? '\n' : '') + pollTag);
                            composerArea.trigger('input'); // Trigger preview update

                            app.alert({
                                type: 'success',
                                alert_id: 'poll-created',
                                title: 'Poll Created',
                                message: 'Poll has been successfully created and added to the post.',
                            });
                        }).catch((err) => {
                            app.alert({
                                type: 'danger',
                                alert_id: 'poll-creation-failed',
                                title: 'Error',
                                message: err.message || 'Failed to create poll.',
                            });
                        });
                    }
                }
            }
        });
    }

    return PollCreator;
});

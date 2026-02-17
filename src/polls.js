'use strict';

const db = require('./database');

const Polls = module.exports;

//create a new poll
Polls.create = async function (pollData) {
	const { title, question, options, creatorUid } = pollData;

	//check if input is valid
	if (!title || !question || !options || !Array.isArray(options) || options.length < 2) {
		throw new Error('Poll data not valid, need title, question, and at least 2 options');
	}
	
	const timestamp = Date.now();
	const pollId = `poll:${timestamp}`;
	
	//poll object
	const poll = {
		pollId: pollId,
		title: title,
		question: question,
		options: JSON.stringify(options.map((option, index) => ({
			optionId: index,
			text: option,
			votes: 0,
		}))),
		creatorUid: creatorUid,
		timestamp: timestamp,
		totalVotes: 0,
	};
	
	await db.setObject(pollId, poll);
	await db.sortedSetAdd('polls:created', timestamp, pollId);
	
	// Parse options back for the return value
	poll.options = JSON.parse(poll.options);
	return poll;
};

//get a poll by ID
Polls.get = async function (pollId) {
	const poll = await db.getObject(pollId);
	if (!poll) {
		throw new Error('Poll not found');
	}
	if (poll.options) {
		poll.options = JSON.parse(poll.options);
	}
	return poll;
};

//get all polls
Polls.getAll = async function () {
	const pollIds = await db.getSortedSetRevRange('polls:created', 0, -1);
	return await Polls.getMultiple(pollIds);
};

//get multiple polls
Polls.getMultiple = async function (pollIds) {
	if (!pollIds || !pollIds.length) {
		return [];
	}
	const polls = await db.getObjects(pollIds);
	return polls.map((poll) => {
		if (poll && poll.options) {
			poll.options = JSON.parse(poll.options);
		}
		return poll;
	});
};

//delete a poll
Polls.delete = async function (pollId) {
	await db.delete(pollId);
	await db.sortedSetRemove('polls:created', pollId);
};

//vote on a poll
Polls.vote = async function (pollId, optionId, uid) {
	//check if user has already voted
	const hasVoted = await db.isSetMember(`${pollId}:voters`, uid);
	if (hasVoted) {
		throw new Error('User has already voted on this poll');
	}

	//get the poll
	const poll = await Polls.get(pollId);

	//find the option and increment votes
	const optionIndex = poll.options.findIndex(opt => opt.optionId === parseInt(optionId, 10));
	if (optionIndex === -1) {
		throw new Error('Option not found');
	}

	poll.options[optionIndex].votes += 1;
	poll.totalVotes = (parseInt(poll.totalVotes, 10) || 0) + 1;

	//update the poll in the database
	const pollToSave = {
		...poll,
		options: JSON.stringify(poll.options),
	};

	await db.setObject(pollId, pollToSave);

	//record that the user has voted and store response
	await db.setAdd(`${pollId}:voters`, uid);
	await db.setObjectField(`${pollId}:responses`, uid, optionId);

	return poll;
};

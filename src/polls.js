'use strict';

const db = require('./database');

const Polls = module.exports;

//create a new poll
Polls.create = async function (pollData) {
	const { title, question, options, creatorUid } = pollData;

	//check if input is valid
	if (!title || !question || !options || !Array.isArray(options) || options.length < 2) {throw new Error('Poll data not valid, need title, question, and at least 2 options');
	}
	
	const timestamp = Date.now();
	const pollId = `poll:${timestamp}`;
	
	//poll object
	const poll = {
		pollId: pollId,
		title: title,
		question: question,
		options: options.map((option, index) => ({
			optionId: index,
			text: option,
			votes: 0,
		})),
		creatorUid: creatorUid,
		timestamp: timestamp,
		totalVotes: 0,
	};
	
	await db.setObject(pollId, poll);
	await db.sortedSetAdd('polls:created', timestamp, pollId);
	
	return poll;
};

//get a poll by ID
Polls.get = async function (pollId) {
	const poll = await db.getObject(pollId);
	if (!poll) {
		throw new Error('Poll not found');
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
	return await db.getObjects(pollIds);
};

//delete a poll
Polls.delete = async function (pollId) {
	await db.delete(pollId);
	await db.sortedSetRemove('polls:created', pollId);
};
'use strict';

const db = require('./database');

const Polls = module.exports;

function addPercentages(poll) {
	const totalVotes = parseInt(poll.totalVotes, 10) || 0;
	poll.options = poll.options.map(option => ({
		...option,
		percentage: totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0,
	}));
	return poll;
}

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
		isClosed: 0,
	};

	await db.setObject(pollId, poll);
	await db.sortedSetAdd('polls:created', timestamp, pollId);

	// Parse options back for the return value
	poll.options = JSON.parse(poll.options);
	return poll;
};

//get a poll by ID
Polls.get = async function (pollId, uid) {
	const poll = await db.getObject(pollId);
	if (!poll) {
		throw new Error('Poll not found');
	}
	if (poll.options) {
		poll.options = JSON.parse(poll.options);
	}
	poll.hasVoted = await db.isSetMember(`${pollId}:voters`, uid);
	poll.isCreator = uid !== undefined && String(poll.creatorUid) === String(uid);
	poll.isClosed = poll.isClosed === 1 || poll.isClosed === '1';
	addPercentages(poll);
	return poll;
};

//get all polls
Polls.getAll = async function (uid) {
	const pollIds = await db.getSortedSetRevRange('polls:created', 0, -1);
	return await Polls.getMultiple(pollIds, uid);
};

//get multiple polls
Polls.getMultiple = async function (pollIds, uid) {
	if (!pollIds || !pollIds.length) {
		return [];
	}
	const polls = await db.getObjects(pollIds);
	return Promise.all(polls.map(async (poll) => {
		if (poll && poll.options) {
			poll.options = JSON.parse(poll.options);
		}
		if (poll) {
			poll.hasVoted = await db.isSetMember(`${poll.pollId}:voters`, uid);
			poll.isCreator = uid !== undefined && String(poll.creatorUid) === String(uid);
			addPercentages(poll);
		}
		return poll;
	}));
};

//delete a poll
Polls.delete = async function (pollId) {
	await db.delete(pollId);
	await db.sortedSetRemove('polls:created', pollId);
};

//vote on a poll
Polls.vote = async function (pollId, optionId, uid) {
	//get the poll
	const poll = await Polls.get(pollId, uid);

	if (poll.isClosed) {
		throw new Error('Poll is closed');
	}

	//find the new option index
	const newOptionIndex = poll.options.findIndex(opt => opt.optionId === parseInt(optionId, 10));
	if (newOptionIndex === -1) {
		throw new Error('Option not found');
	}

	//check if user has already voted
	const hasVoted = await db.isSetMember(`${pollId}:voters`, uid);

	if (hasVoted) {
		// Get the old vote
		const oldOptionIdStr = await db.getObjectField(`${pollId}:responses`, uid);

		// If they voted for the exact same thing, just return
		if (oldOptionIdStr === String(optionId)) {
			poll.hasVoted = true;
			return poll;
		}

		// Decrement old option
		const oldOptionIndex = poll.options.findIndex(opt => opt.optionId === parseInt(oldOptionIdStr, 10));
		if (oldOptionIndex !== -1) {
			poll.options[oldOptionIndex].votes = Math.max(0, poll.options[oldOptionIndex].votes - 1);
		}
		// totalVotes remains the same since they are just changing their vote
	} else {
		// New vote, increment total
		poll.totalVotes = (parseInt(poll.totalVotes, 10) || 0) + 1;
		await db.setAdd(`${pollId}:voters`, uid);
	}

	// Increment new option
	poll.options[newOptionIndex].votes += 1;

	//update the poll in the database
	const pollToSave = {
		...poll,
		options: JSON.stringify(poll.options),
	};

	await db.setObject(pollId, pollToSave);

	//store new response
	await db.setObjectField(`${pollId}:responses`, uid, optionId);

	addPercentages(poll);
	poll.hasVoted = true;
	return poll;
};

//close a poll (creator only)
Polls.close = async function (pollId, uid) {
	const poll = await Polls.get(pollId, uid);

	if (!poll.isCreator) {
		throw new Error('Only the poll creator can close a poll');
	}

	if (poll.isClosed) {
		throw new Error('Poll is already closed');
	}

	await db.setObjectField(pollId, 'isClosed', 1);
	poll.isClosed = true;
	return poll;
};

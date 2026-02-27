'use strict';

const db = require('./mocks/databasemock');

const assert = require('assert');
const Polls = require('../src/polls');

describe('Polls', () => {
	let pollData;
	const uid = 1;
	const otherUid = 2;

	before(async () => {
		pollData = await Polls.create({
			title: 'Test Poll',
			question: 'What is your favorite color?',
			options: ['Red', 'Blue', 'Green'],
			creatorUid: uid,
		});
	});

	describe('.create()', () => {
		it('should create a poll with correct fields', () => {
			assert(pollData.pollId);
			assert.strictEqual(pollData.title, 'Test Poll');
			assert.strictEqual(pollData.question, 'What is your favorite color?');
			assert.strictEqual(pollData.options.length, 3);
			assert.strictEqual(pollData.totalVotes, 0);
			assert.strictEqual(pollData.creatorUid, uid);
		});

		it('should assign optionIds to each option', () => {
			pollData.options.forEach((opt, i) => {
				assert.strictEqual(opt.optionId, i);
				assert.strictEqual(opt.votes, 0);
			});
		});

		it('should throw if title is missing', async () => {
			await assert.rejects(
				Polls.create({ question: 'Q', options: ['A', 'B'], creatorUid: uid }),
				/Poll data not valid/,
			);
		});

		it('should throw if fewer than 2 options', async () => {
			await assert.rejects(
				Polls.create({ title: 'T', question: 'Q', options: ['A'], creatorUid: uid }),
				/Poll data not valid/,
			);
		});
	});

	describe('.get()', () => {
		it('should return a poll by ID with parsed options', async () => {
			const poll = await Polls.get(pollData.pollId, uid);
			assert.strictEqual(poll.title, 'Test Poll');
			assert(Array.isArray(poll.options));
			assert.strictEqual(poll.options.length, 3);
		});

		it('should include hasVoted field', async () => {
			const poll = await Polls.get(pollData.pollId, uid);
			assert.strictEqual(poll.hasVoted, false);
		});

		it('should set isCreator true for the creator', async () => {
			const poll = await Polls.get(pollData.pollId, uid);
			assert.strictEqual(poll.isCreator, true);
		});

		it('should set isCreator false for a non-creator', async () => {
			const poll = await Polls.get(pollData.pollId, otherUid);
			assert.strictEqual(poll.isCreator, false);
		});

		it('should include percentage 0 on each option before any votes', async () => {
			const poll = await Polls.get(pollData.pollId, uid);
			poll.options.forEach(opt => assert.strictEqual(opt.percentage, 0));
		});

		it('should throw for non-existent poll', async () => {
			await assert.rejects(
				Polls.get('poll:nonexistent', uid),
				/Poll not found/,
			);
		});
	});

	describe('.getAll()', () => {
		it('should return all polls with hasVoted', async () => {
			const polls = await Polls.getAll(uid);
			assert(Array.isArray(polls));
			assert(polls.length >= 1);
			const found = polls.find(p => p.pollId === pollData.pollId);
			assert(found);
			assert.strictEqual(found.hasVoted, false);
		});
	});

	describe('.vote()', () => {
		it('should record a vote and increment counts', async () => {
			const poll = await Polls.vote(pollData.pollId, 0, uid);
			assert.strictEqual(poll.options[0].votes, 1);
			assert.strictEqual(poll.totalVotes, 1);
			assert.strictEqual(poll.hasVoted, true);
		});

		it('should reflect hasVoted after voting', async () => {
			const poll = await Polls.get(pollData.pollId, uid);
			assert.strictEqual(poll.hasVoted, true);
		});

		it('should allow user to change their vote', async () => {
			const poll = await Polls.vote(pollData.pollId, 1, uid);
			// Old option decremented
			assert.strictEqual(poll.options[0].votes, 0);
			// New option incremented
			assert.strictEqual(poll.options[1].votes, 1);
			// Total votes remains the same
			assert.equal(poll.totalVotes, 1);
			assert.strictEqual(poll.hasVoted, true);
		});

		it('should allow user to vote for the exact same option without incrementing', async () => {
			const poll = await Polls.vote(pollData.pollId, 1, uid);
			// Option votes and total votes remain unchanged
			assert.strictEqual(poll.options[1].votes, 1);
			assert.equal(poll.totalVotes, 1);
			assert.strictEqual(poll.hasVoted, true);
		});

		it('should allow a different user to vote', async () => {
			const poll = await Polls.vote(pollData.pollId, 1, otherUid);
			assert.strictEqual(poll.options[1].votes, 2); // UID 1 and UID 2 both voted for option 1
			assert.equal(poll.totalVotes, 2);
		});

		it('should include correct percentages after voting', async () => {
			const poll = await Polls.get(pollData.pollId, uid);
			const total = parseInt(poll.totalVotes, 10);
			poll.options.forEach(opt => {
				const expected = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
				assert.strictEqual(opt.percentage, expected);
			});
		});

		it('should throw for invalid optionId', async () => {
			await assert.rejects(
				Polls.vote(pollData.pollId, 999, 3),
				/Option not found/,
			);
		});
	});

	describe('.delete()', () => {
		it('should delete a poll', async () => {
			const tempPoll = await Polls.create({
				title: 'Temp',
				question: 'Q',
				options: ['A', 'B'],
				creatorUid: uid,
			});
			await Polls.delete(tempPoll.pollId);
			await assert.rejects(
				Polls.get(tempPoll.pollId, uid),
				/Poll not found/,
			);
		});
	});
});

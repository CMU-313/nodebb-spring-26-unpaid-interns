'use strict';

const Polls = require('../polls');

const pollsController = module.exports;

pollsController.create = async function (req, res, next) {
	try {
		const { title, question, options } = req.body;
		// User check, although usually handled by middleware
		const creatorUid = req.uid; 

		const poll = await Polls.create({
			title, 
			question, 
			options, 
			creatorUid,
		});
		res.json(poll);
	} catch (err) {
		next(err);
	}
};

pollsController.get = async function (req, res, next) {
	try {
		const poll = await Polls.get(req.params.pollId);
		res.json(poll);
	} catch (err) {
		next(err);
	}
};

pollsController.getAll = async function (req, res, next) {
	try {
		const polls = await Polls.getAll();
		res.json(polls);
	} catch (err) {
		next(err);
	}
};

pollsController.delete = async function (req, res, next) {
	try {
		await Polls.delete(req.params.pollId);
		res.json({ message: 'Poll deleted successfully' });
	} catch (err) {
		next(err);
	}
};

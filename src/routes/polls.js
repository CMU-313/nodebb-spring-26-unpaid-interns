'use strict';

const express = require('express');
const helpers = require('./helpers');

module.exports = function (app, middleware, controllers) {
	const apiRouter = express.Router();
	app.use('/api', apiRouter);

	const middlewares = [
		middleware.ensureLoggedIn,
	];

	apiRouter.post('/polls', [...middlewares], helpers.tryRoute(controllers.polls.create));
	apiRouter.get('/polls', [...middlewares], helpers.tryRoute(controllers.polls.getAll));
	apiRouter.get('/polls/:pollId', [...middlewares], helpers.tryRoute(controllers.polls.get));
	apiRouter.delete('/polls/:pollId', [...middlewares], helpers.tryRoute(controllers.polls.delete));
};

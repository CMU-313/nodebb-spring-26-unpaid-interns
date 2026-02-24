'use strict';


const assert = require('assert');
const nconf = require('nconf');

const db = require('./mocks/databasemock');
const topics = require('../src/topics');
const categories = require('../src/categories');
const user = require('../src/user');
const search = require('../src/search');
const searchApi = require('../src/api/search');
const privileges = require('../src/privileges');
const request = require('../src/request');

describe('Search', () => {
	let phoebeUid;
	let gingerUid;

	let topic1Data;
	let topic2Data;
	let post1Data;
	let post2Data;
	let post3Data;
	let cid1;
	let cid2;
	let cid3;

	before(async () => {
		phoebeUid = await user.create({ username: 'phoebe' });
		gingerUid = await user.create({ username: 'ginger' });
		cid1 = (await categories.create({
			name: 'Test Category',
			description: 'Test category created by testing script',
		})).cid;

		cid2 = (await categories.create({
			name: 'Test Category',
			description: 'Test category created by testing script',
		})).cid;

		cid3 = (await categories.create({
			name: 'Child Test Category',
			description: 'Test category created by testing script',
			parentCid: cid2,
		})).cid;

		({ topicData: topic1Data, postData: post1Data } = await topics.post({
			uid: phoebeUid,
			cid: cid1,
			title: 'nodebb mongodb bugs',
			content: 'avocado cucumber apple orange fox',
			tags: ['nodebb', 'bug', 'plugin', 'nodebb-plugin', 'jquery'],
		}));

		({ topicData: topic2Data, postData: post2Data } = await topics.post({
			uid: gingerUid,
			cid: cid2,
			title: 'java mongodb redis',
			content: 'avocado cucumber carrot armadillo',
			tags: ['nodebb', 'bug', 'plugin', 'nodebb-plugin', 'javascript'],
		}));
		post3Data = await topics.reply({
			uid: phoebeUid,
			content: 'reply post apple',
			tid: topic2Data.tid,
		});
	});

	it('should search term in titles and posts', async () => {
		const meta = require('../src/meta');
		const qs = `/api/search?term=cucumber&in=titlesposts&categories[]=${cid1}&by=phoebe&replies=1&repliesFilter=atleast&sortBy=timestamp&sortDirection=desc&showAs=posts`;
		await privileges.global.give(['groups:search:content'], 'guests');

		const { body } = await request.get(nconf.get('url') + qs);
		assert(body);
		assert.equal(body.matchCount, 1);
		assert.equal(body.posts.length, 1);
		assert.equal(body.posts[0].pid, post1Data.pid);
		assert.equal(body.posts[0].uid, phoebeUid);

		await privileges.global.rescind(['groups:search:content'], 'guests');
	});

	it('should search for a user', (done) => {
		search.search({
			query: 'gin',
			searchIn: 'users',
		}, (err, data) => {
			assert.ifError(err);
			assert(data);
			assert.equal(data.matchCount, 1);
			assert.equal(data.users.length, 1);
			assert.equal(data.users[0].uid, gingerUid);
			assert.equal(data.users[0].username, 'ginger');
			done();
		});
	});

	it('should search for a tag', (done) => {
		search.search({
			query: 'plug',
			searchIn: 'tags',
		}, (err, data) => {
			assert.ifError(err);
			assert(data);
			assert.equal(data.matchCount, 1);
			assert.equal(data.tags.length, 1);
			assert.equal(data.tags[0].value, 'plugin');
			assert.equal(data.tags[0].score, 2);
			done();
		});
	});

	it('should search for a category', async () => {
		await categories.create({
			name: 'foo category',
			description: 'Test category created by testing script',
		});
		await categories.create({
			name: 'baz category',
			description: 'Test category created by testing script',
		});
		const result = await search.search({
			query: 'baz',
			searchIn: 'categories',
		});
		assert.strictEqual(result.matchCount, 1);
		assert.strictEqual(result.categories[0].name, 'baz category');
	});

	it('should search for categories', async () => {
		const socketCategories = require('../src/socket.io/categories');
		let data = await socketCategories.categorySearch({ uid: phoebeUid }, { query: 'baz', parentCid: 0 });
		assert.strictEqual(data[0].name, 'baz category');
		data = await socketCategories.categorySearch({ uid: phoebeUid }, { query: '', parentCid: 0 });
		assert.strictEqual(data.length, 5);
	});

	it('should fail if searchIn is wrong', (done) => {
		search.search({
			query: 'plug',
			searchIn: '',
		}, (err) => {
			assert.equal(err.message, '[[error:unknown-search-filter]]');
			done();
		});
	});

	it('should search with tags filter', (done) => {
		search.search({
			query: 'mongodb',
			searchIn: 'titles',
			hasTags: ['nodebb', 'javascript'],
		}, (err, data) => {
			assert.ifError(err);
			assert.equal(data.posts[0].tid, topic2Data.tid);
			done();
		});
	});

	it('should not crash if tags is not an array', (done) => {
		search.search({
			query: 'mongodb',
			searchIn: 'titles',
			hasTags: 'nodebb,javascript',
		}, (err, data) => {
			assert.ifError(err);
			done();
		});
	});

	it('should not find anything', (done) => {
		search.search({
			query: 'xxxxxxxxxxxxxx',
			searchIn: 'titles',
		}, (err, data) => {
			assert.ifError(err);
			assert(Array.isArray(data.posts));
			assert(!data.matchCount);
			done();
		});
	});

	it('should search child categories', async () => {
		await topics.post({
			uid: gingerUid,
			cid: cid3,
			title: 'child category topic',
			content: 'avocado cucumber carrot armadillo',
		});
		const result = await search.search({
			query: 'avocado',
			searchIn: 'titlesposts',
			categories: [cid2],
			searchChildren: true,
			sortBy: 'topic.timestamp',
			sortDirection: 'desc',
		});
		assert(result.posts.length, 2);
		assert(result.posts[0].topic.title === 'child category topic');
		assert(result.posts[1].topic.title === 'java mongodb redis');
	});

	it('should return json search data with no categories', async () => {
		const qs = '/api/search?term=cucumber&in=titlesposts&searchOnly=1';
		await privileges.global.give(['groups:search:content'], 'guests');

		const { body } = await request.get(nconf.get('url') + qs);
		assert(body);
		assert(body.hasOwnProperty('matchCount'));
		assert(body.hasOwnProperty('pagination'));
		assert(body.hasOwnProperty('pageCount'));
		assert(body.hasOwnProperty('posts'));
		assert(!body.hasOwnProperty('categories'));

		await privileges.global.rescind(['groups:search:content'], 'guests');
	});

	it('should not crash without a search term', async () => {
		const qs = '/api/search';
		await privileges.global.give(['groups:search:content'], 'guests');
		const { response, body } = await request.get(nconf.get('url') + qs);
		assert(body);
		assert.strictEqual(response.statusCode, 200);
		await privileges.global.rescind(['groups:search:content'], 'guests');
	});

	it('should save, load, and clear user search history by recency', async () => {
		const caller = { uid: phoebeUid };
		const originalNow = Date.now;
		let ts = 1700000000000;

		Date.now = () => {
			ts += 1;
			return ts;
		};

		try {
			await searchApi.clearHistory(caller);

			await searchApi.saveHistory(caller, { query: 'A', searchIn: 'titlesposts' });
			await searchApi.saveHistory(caller, { query: 'B', searchIn: 'titlesposts' });
			await searchApi.saveHistory(caller, { query: 'C', searchIn: 'titlesposts' });

			let history = await searchApi.getHistory(caller, { limit: 10 });
			assert.deepStrictEqual(history.searches.map(item => item.query), ['C', 'B', 'A']);

			await searchApi.saveHistory(caller, { query: 'B', searchIn: 'titlesposts' });
			history = await searchApi.getHistory(caller, { limit: 10 });
			assert.deepStrictEqual(history.searches.map(item => item.query), ['B', 'C', 'A']);

			await Promise.all(Array.from({ length: 12 }, (_, i) => (
				searchApi.saveHistory(caller, { query: `query-${i}`, searchIn: 'titlesposts' })
			)));

			history = await searchApi.getHistory(caller, { limit: 20 });
			assert.strictEqual(history.searches.length, 10);
			assert.strictEqual(history.searches[0].query, 'query-11');
			assert.strictEqual(history.searches[9].query, 'query-2');

			await searchApi.clearHistory(caller);
			history = await searchApi.getHistory(caller, { limit: 10 });
			assert.deepStrictEqual(history.searches, []);
		} finally {
			Date.now = originalNow;
		}
	});

	describe('Search Autocomplete API', () => {
		it('should return autocomplete suggestions based on search history', async () => {
			const caller = { uid: gingerUid };
			await searchApi.clearHistory(caller);

			// Save some search history
			await searchApi.saveHistory(caller, { query: 'epl', searchIn: 'titlesposts' });
			await searchApi.saveHistory(caller, { query: 'epic games', searchIn: 'titlesposts' });
			await searchApi.saveHistory(caller, { query: 'nodejs', searchIn: 'titlesposts' });

			// Test prefix match for 'e'
			let result = await searchApi.autocomplete(caller, { query: 'e', limit: 10 });
			assert(result.suggestions);
			assert.strictEqual(result.suggestions.length, 2);
			assert(result.suggestions.some(s => s.query === 'epl'));
			assert(result.suggestions.some(s => s.query === 'epic games'));

			// Test prefix match for 'ep'
			result = await searchApi.autocomplete(caller, { query: 'ep', limit: 10 });
			assert.strictEqual(result.suggestions.length, 2);
			assert(result.suggestions.some(s => s.query === 'epl'));
			assert(result.suggestions.some(s => s.query === 'epic games'));

			// Test prefix match for 'epi'
			result = await searchApi.autocomplete(caller, { query: 'epi', limit: 10 });
			assert.strictEqual(result.suggestions.length, 1);
			assert.strictEqual(result.suggestions[0].query, 'epic games');

			// Test no match
			result = await searchApi.autocomplete(caller, { query: 'xyz', limit: 10 });
			assert.strictEqual(result.suggestions.length, 0);

			await searchApi.clearHistory(caller);
		});

		it('should return autocomplete suggestions in most recent order', async () => {
			const caller = { uid: gingerUid };
			const originalNow = Date.now;
			let ts = 1700000000000;

			Date.now = () => {
				ts += 1000;
				return ts;
			};

			try {
				await searchApi.clearHistory(caller);

				// Save searches with different timestamps
				await searchApi.saveHistory(caller, { query: 'apple', searchIn: 'titlesposts' });
				await searchApi.saveHistory(caller, { query: 'apricot', searchIn: 'titlesposts' });
				await searchApi.saveHistory(caller, { query: 'avocado', searchIn: 'titlesposts' });

				const result = await searchApi.autocomplete(caller, { query: 'a', limit: 10 });
				assert.strictEqual(result.suggestions.length, 3);
				// Most recent should be first
				assert.strictEqual(result.suggestions[0].query, 'avocado');
				assert.strictEqual(result.suggestions[1].query, 'apricot');
				assert.strictEqual(result.suggestions[2].query, 'apple');

				await searchApi.clearHistory(caller);
			} finally {
				Date.now = originalNow;
			}
		});

		it('should respect the limit parameter', async () => {
			const caller = { uid: gingerUid };
			await searchApi.clearHistory(caller);

			// Save multiple searches with same prefix
			await searchApi.saveHistory(caller, { query: 'test1', searchIn: 'titlesposts' });
			await searchApi.saveHistory(caller, { query: 'test2', searchIn: 'titlesposts' });
			await searchApi.saveHistory(caller, { query: 'test3', searchIn: 'titlesposts' });
			await searchApi.saveHistory(caller, { query: 'test4', searchIn: 'titlesposts' });
			await searchApi.saveHistory(caller, { query: 'test5', searchIn: 'titlesposts' });

			const result = await searchApi.autocomplete(caller, { query: 'test', limit: 3 });
			assert.strictEqual(result.suggestions.length, 3);

			await searchApi.clearHistory(caller);
		});

		it('should be case-insensitive for prefix matching', async () => {
			const caller = { uid: gingerUid };
			await searchApi.clearHistory(caller);

			await searchApi.saveHistory(caller, { query: 'NodeBB', searchIn: 'titlesposts' });
			await searchApi.saveHistory(caller, { query: 'NODEJS', searchIn: 'titlesposts' });

			// Test lowercase query
			let result = await searchApi.autocomplete(caller, { query: 'node', limit: 10 });
			assert.strictEqual(result.suggestions.length, 2);

			// Test uppercase query
			result = await searchApi.autocomplete(caller, { query: 'NODE', limit: 10 });
			assert.strictEqual(result.suggestions.length, 2);

			// Test mixed case query
			result = await searchApi.autocomplete(caller, { query: 'NoDe', limit: 10 });
			assert.strictEqual(result.suggestions.length, 2);

			await searchApi.clearHistory(caller);
		});

		it('should return empty array for empty query', async () => {
			const caller = { uid: gingerUid };
			const result = await searchApi.autocomplete(caller, { query: '', limit: 10 });
			assert.deepStrictEqual(result.suggestions, []);
		});

		it('should only return suggestions from user\'s own search history', async () => {
			const caller1 = { uid: phoebeUid };
			const caller2 = { uid: gingerUid };

			await searchApi.clearHistory(caller1);
			await searchApi.clearHistory(caller2);

			// User 1 searches for 'mongodb'
			await searchApi.saveHistory(caller1, { query: 'mongodb', searchIn: 'titlesposts' });

			// User 2 should not see user 1's search
			const result = await searchApi.autocomplete(caller2, { query: 'm', limit: 10 });
			assert.strictEqual(result.suggestions.length, 0);

			// User 2 searches for 'mysql'
			await searchApi.saveHistory(caller2, { query: 'mysql', searchIn: 'titlesposts' });

			// User 2 should only see their own search
			const result2 = await searchApi.autocomplete(caller2, { query: 'm', limit: 10 });
			assert.strictEqual(result2.suggestions.length, 1);
			assert.strictEqual(result2.suggestions[0].query, 'mysql');

			await searchApi.clearHistory(caller1);
			await searchApi.clearHistory(caller2);
		});
	});
});

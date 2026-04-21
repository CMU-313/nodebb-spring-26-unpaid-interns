'use strict';

const path = require('path');
const nconf = require('nconf');

nconf.argv().env({
	separator: '__',
});

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const prestart = require('../src/prestart');

const configFile = path.resolve(
	__dirname,
	'../',
	nconf.any(['config', 'CONFIG']) || 'config.json'
);

prestart.loadConfig(configFile);
prestart.setupWinston();

const db = require('../src/database');
const meta = require('../src/meta');
const Topics = require('../src/topics');

const SEED_KEY = 'seed:hindi-translation-demo';
const SEED_TOPIC_TITLE = 'हिंदी अनुवाद परीक्षण पोस्ट';

async function pickCategoryId() {
	const cids = await db.getSortedSetRevRange('categories:cid', 0, -1);
	const preferredCid = cids.map(cid => parseInt(cid, 10)).find(cid => Number.isInteger(cid) && cid > 0);

	if (!preferredCid) {
		throw new Error('No category exists to seed Hindi topic');
	}

	return preferredCid;
}

async function main() {
	await db.init();
	await db.initSessionStore();
	await meta.configs.init();

	const hasSeeded = await db.exists(SEED_KEY);
	if (hasSeeded) {
		console.log('[seed-hindi-post] Hindi demo post already seeded, skipping.');
		return;
	}

	const cid = await pickCategoryId();
	const result = await Topics.post({
		uid: 1,
		cid: cid,
		title: SEED_TOPIC_TITLE,
		content: [
			'नमस्ते! यह पोस्ट अनुवाद फीचर को टेस्ट करने के लिए बनाई गई है।',
			'कृपया Translate बटन दबाकर इसे अंग्रेज़ी में बदलकर देखें।',
			'यदि अनुवाद सफल हो जाए, तो इसका मतलब फीचर सही काम कर रहा है।',
		].join('\n\n'),
	});

	await db.setObject(SEED_KEY, {
		tid: result.topicData && result.topicData.tid,
		pid: result.postData && result.postData.pid,
		seededAt: Date.now(),
	});

	console.log(`[seed-hindi-post] Seeded Hindi demo post in cid ${cid}.`);
}

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error('[seed-hindi-post] Failed to seed Hindi post:', err);
		process.exit(1);
	});
'use strict';

/**
 * Admin API for Synonym Management
 */

const synonyms = require('../synonyms');
const privileges = require('../privileges');

const SynonymsAdmin = module.exports;

/**
 * Get all synonym sets
 */
SynonymsAdmin.getSynonymSets = async function (req, res) {
	if (!await privileges.admin.can('admin:settings', req.uid)) {
		return res.status(403).json({ error: 'Not authorized' });
	}
	
	const sets = synonyms.getAllSynonymSets();
	const stats = synonyms.getStats();
	
	res.json({
		sets: sets,
		stats: stats,
	});
};

/**
 * Add a new synonym set
 */
SynonymsAdmin.addSynonymSet = async function (req, res) {
	if (!await privileges.admin.can('admin:settings', req.uid)) {
		return res.status(403).json({ error: 'Not authorized' });
	}
	
	const { words } = req.body;
	
	if (!Array.isArray(words) || words.length < 2) {
		return res.status(400).json({ error: 'Synonym set must contain at least 2 words' });
	}
	
	try {
		await synonyms.addCustomSynonyms(words);
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

/**
 * Test synonym matching
 */
SynonymsAdmin.testSynonyms = async function (req, res) {
	if (!await privileges.admin.can('admin:settings', req.uid)) {
		return res.status(403).json({ error: 'Not authorized' });
	}
	
	const { word1, word2 } = req.query;
	
	if (!word1 || !word2) {
		return res.status(400).json({ error: 'Both word1 and word2 parameters are required' });
	}
	
	const areSynonyms = synonyms.areSynonyms(word1, word2);
	const synonymsFor1 = synonyms.getSynonyms(word1);
	const synonymsFor2 = synonyms.getSynonyms(word2);
	
	res.json({
		word1: word1,
		word2: word2,
		areSynonyms: areSynonyms,
		synonymsForWord1: synonymsFor1,
		synonymsForWord2: synonymsFor2,
	});
};

/**
 * Calculate synonym score for test content
 */
SynonymsAdmin.calculateScore = async function (req, res) {
	if (!await privileges.admin.can('admin:settings', req.uid)) {
		return res.status(403).json({ error: 'Not authorized' });
	}
	
	const { searchTerms, content } = req.body;
	
	if (!searchTerms || !content) {
		return res.status(400).json({ error: 'searchTerms and content are required' });
	}
	
	const terms = Array.isArray(searchTerms) ? searchTerms : searchTerms.split(/\s+/);
	const details = synonyms.getMatchDetails(terms, content);
	
	res.json({
		searchTerms: terms,
		content: content,
		score: details.score,
		matches: details.matches,
	});
};

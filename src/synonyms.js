'use strict';

/**
 * Synonym Search Module for NodeBB
 * 
 * This module provides synonym matching capabilities to improve search relevance.
 * When a search term and post word are synonyms, the post receives a higher ranking.
 */

const _ = require('lodash');
const db = require('./database');
const plugins = require('./plugins');

const Synonyms = module.exports;

// In-memory cache for synonyms
let synonymCache = {};
let synonymGraph = new Map(); // For bidirectional lookup

/**
 * Default synonym sets - can be extended via configuration or plugins
 * Each set contains words that are considered synonyms of each other
 */
const defaultSynonymSets = [
	// Technology terms
	['bug', 'issue', 'problem', 'error', 'defect'],
	['fix', 'repair', 'resolve', 'correct', 'patch'],
	['feature', 'functionality', 'capability', 'option'],
	['user', 'member', 'account', 'profile'],
	['post', 'message', 'comment', 'reply'],
	['search', 'find', 'lookup', 'query'],
	['delete', 'remove', 'erase', 'clear'],
	['update', 'modify', 'change', 'edit', 'alter'],
	['create', 'add', 'make', 'generate', 'build'],
	['install', 'setup', 'configure', 'deploy'],
	
	// General terms
	['help', 'assist', 'support', 'aid'],
	['question', 'inquiry', 'query', 'ask'],
	['answer', 'response', 'reply', 'solution'],
	['guide', 'tutorial', 'howto', 'walkthrough', 'instructions'],
	['start', 'begin', 'launch', 'initialize'],
	['stop', 'end', 'terminate', 'halt', 'quit'],
	['fast', 'quick', 'rapid', 'speedy', 'swift'],
	['slow', 'sluggish', 'laggy', 'delayed'],
	['good', 'great', 'excellent', 'awesome', 'nice'],
	['bad', 'poor', 'terrible', 'awful'],
	
	// NodeBB specific
	['topic', 'thread', 'discussion'],
	['category', 'section', 'forum'],
	['admin', 'administrator', 'moderator', 'mod'],
	['notification', 'alert', 'notice'],
	['settings', 'preferences', 'configuration', 'options'],
];

/**
 * Initialize the synonym system
 */
Synonyms.init = async function () {
	// Load default synonyms
	for (const synonymSet of defaultSynonymSets) {
		addSynonymSet(synonymSet);
	}
	
	// Load custom synonyms from database
	await loadCustomSynonyms();
	
	// Allow plugins to add synonyms
	const result = await plugins.hooks.fire('filter:synonyms.init', {
		synonymSets: defaultSynonymSets,
	});
	
	if (result && result.synonymSets) {
		for (const synonymSet of result.synonymSets) {
			if (Array.isArray(synonymSet) && synonymSet.length > 1) {
				addSynonymSet(synonymSet);
			}
		}
	}
};

/**
 * Add a set of synonyms to the cache
 * @param {Array<string>} words - Array of words that are synonyms of each other
 */
function addSynonymSet(words) {
	// Normalize words (lowercase, trim)
	const normalizedWords = words.map(w => String(w).toLowerCase().trim());
	
	// Create a unique set ID
	const setId = normalizedWords.sort().join('|');
	
	// Map each word to the full synonym set
	for (const word of normalizedWords) {
		if (!synonymCache[word]) {
			synonymCache[word] = new Set();
		}
		// Add all other words as synonyms
		normalizedWords.forEach((synonym) => {
			if (synonym !== word) {
				synonymCache[word].add(synonym);
			}
		});
		
		// Update graph for bidirectional lookup
		if (!synonymGraph.has(word)) {
			synonymGraph.set(word, new Set());
		}
		normalizedWords.forEach((synonym) => {
			if (synonym !== word) {
				synonymGraph.get(word).add(synonym);
			}
		});
	}
}

/**
 * Load custom synonyms from database
 */
async function loadCustomSynonyms() {
	try {
		const customSynonyms = await db.getObject('synonyms:custom');
		if (customSynonyms && customSynonyms.sets) {
			const sets = JSON.parse(customSynonyms.sets);
			if (Array.isArray(sets)) {
				sets.forEach(set => addSynonymSet(set));
			}
		}
	} catch (err) {
		// Custom synonyms not found or invalid - use defaults only
	}
}

/**
 * Check if two words are synonyms
 * @param {string} word1 - First word
 * @param {string} word2 - Second word
 * @returns {boolean} True if words are synonyms
 */
Synonyms.areSynonyms = function (word1, word2) {
	if (!word1 || !word2) {
		return false;
	}
	
	const w1 = String(word1).toLowerCase().trim();
	const w2 = String(word2).toLowerCase().trim();
	
	// Same word is not a synonym (it's an exact match)
	if (w1 === w2) {
		return false;
	}
	
	// Check if w2 is in w1's synonym set
	return synonymCache[w1] && synonymCache[w1].has(w2);
};

/**
 * Get all synonyms for a word
 * @param {string} word - The word to find synonyms for
 * @returns {Array<string>} Array of synonyms
 */
Synonyms.getSynonyms = function (word) {
	if (!word) {
		return [];
	}
	
	const normalized = String(word).toLowerCase().trim();
	if (synonymCache[normalized]) {
		return Array.from(synonymCache[normalized]);
	}
	return [];
};

/**
 * Calculate synonym match score for a post
 * 
 * Algorithm:
 * For search terms a_1, a_2, ..., a_n
 * For post words P_1, P_2, ..., P_N
 * Check each (a_i, P_j) pair and count synonym matches
 * 
 * @param {Array<string>} searchTerms - Array of search term words [a_1, a_2, ..., a_n]
 * @param {string} postContent - Post content (title + content concatenated)
 * @returns {number} Synonym match score
 */
Synonyms.calculateScore = function (searchTerms, postContent) {
	if (!Array.isArray(searchTerms) || !searchTerms.length || !postContent) {
		return 0;
	}
	
	// Normalize and tokenize post content into words [P_1, P_2, ..., P_N]
	const postWords = tokenize(postContent);
	
	// Normalize search terms [a_1, a_2, ..., a_n]
	const normalizedTerms = searchTerms.map(term => String(term).toLowerCase().trim());
	
	let synonymScore = 0;
	
	// For each search term a_i
	for (const searchTerm of normalizedTerms) {
		// For each post word P_j
		for (const postWord of postWords) {
			// Check if (a_i, P_j) are synonyms
			if (Synonyms.areSynonyms(searchTerm, postWord)) {
				synonymScore++;
			}
		}
	}
	
	return synonymScore;
};

/**
 * Calculate detailed synonym match information
 * @param {Array<string>} searchTerms - Array of search term words
 * @param {string} postContent - Post content
 * @returns {Object} Detailed match information
 */
Synonyms.getMatchDetails = function (searchTerms, postContent) {
	if (!Array.isArray(searchTerms) || !searchTerms.length || !postContent) {
		return { score: 0, matches: [] };
	}
	
	const postWords = tokenize(postContent);
	const normalizedTerms = searchTerms.map(term => String(term).toLowerCase().trim());
	
	const matches = [];
	let score = 0;
	
	for (const searchTerm of normalizedTerms) {
		for (const postWord of postWords) {
			if (Synonyms.areSynonyms(searchTerm, postWord)) {
				matches.push({
					searchTerm: searchTerm,
					postWord: postWord,
				});
				score++;
			}
		}
	}
	
	return { score, matches };
};

/**
 * Tokenize text into words
 * Removes punctuation, HTML tags, and normalizes whitespace
 * @param {string} text - Text to tokenize
 * @returns {Array<string>} Array of words
 */
function tokenize(text) {
	if (!text) {
		return [];
	}
	
	// Remove HTML tags
	let cleaned = String(text).replace(/<[^>]*>/g, ' ');
	
	// Remove punctuation and special characters
	cleaned = cleaned.replace(/[^\w\s]/g, ' ');
	
	// Split by whitespace and filter out empty strings
	const words = cleaned.toLowerCase().split(/\s+/).filter(Boolean);
	
	return words;
}

/**
 * Add custom synonym set (admin function)
 * @param {Array<string>} words - Array of words to add as synonyms
 */
Synonyms.addCustomSynonyms = async function (words) {
	if (!Array.isArray(words) || words.length < 2) {
		throw new Error('Synonym set must contain at least 2 words');
	}
	
	// Add to cache
	addSynonymSet(words);
	
	// Persist to database
	let customSynonyms = await db.getObject('synonyms:custom');
	if (!customSynonyms || !customSynonyms.sets) {
		customSynonyms = { sets: '[]' };
	}
	
	const sets = JSON.parse(customSynonyms.sets);
	sets.push(words);
	customSynonyms.sets = JSON.stringify(sets);
	
	await db.setObject('synonyms:custom', customSynonyms);
};

/**
 * Get all synonym sets (admin function)
 * @returns {Array<Array<string>>} Array of synonym sets
 */
Synonyms.getAllSynonymSets = function () {
	const sets = new Map();
	
	// Group words by their synonym sets
	for (const [word, synonyms] of Object.entries(synonymCache)) {
		const setKey = [word, ...Array.from(synonyms)].sort().join('|');
		if (!sets.has(setKey)) {
			sets.set(setKey, [word, ...Array.from(synonyms)]);
		}
	}
	
	return Array.from(sets.values());
};

/**
 * Clear all synonyms (useful for testing)
 */
Synonyms.clear = function () {
	synonymCache = {};
	synonymGraph.clear();
};

/**
 * Get synonym cache statistics
 * @returns {Object} Statistics about the synonym cache
 */
Synonyms.getStats = function () {
	const wordCount = Object.keys(synonymCache).length;
	const sets = Synonyms.getAllSynonymSets();
	
	return {
		totalWords: wordCount,
		totalSets: sets.length,
		averageSynonymsPerWord: wordCount > 0 ?
			Object.values(synonymCache).reduce((sum, set) => sum + set.size, 0) / wordCount :
			0,
	};
};

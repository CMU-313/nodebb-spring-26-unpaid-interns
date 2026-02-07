#!/usr/bin/env node

'use strict';

/**
 * Test script for synonym search functionality
 * Demonstrates how synonym search works in NodeBB
 * 
 * Usage: node test-synonym-search.js
 */

// Bootstrap NodeBB
require('./require-main');

const nconf = require('nconf');
const path = require('path');

nconf.argv().env({ separator: '__' });

const configFile = path.resolve(__dirname, nconf.any(['config', 'CONFIG']) || 'config.json');
const prestart = require('./src/prestart');

prestart.loadConfig(configFile);
prestart.setupWinston();

const db = require('./src/database');
const synonyms = require('./src/synonyms');
const search = require('./src/search');

async function testSynonyms() {
	console.log('=== NodeBB Synonym Search Test ===\n');
	
	try {
		// Initialize database and synonyms
		await db.init();
		await synonyms.init();
		console.log('✓ Synonym system initialized\n');
		
		// Get statistics
		const stats = synonyms.getStats();
		console.log('Synonym Statistics:');
		console.log(`  Total Words: ${stats.totalWords}`);
		console.log(`  Total Synonym Sets: ${stats.totalSets}`);
		console.log(`  Avg Synonyms/Word: ${stats.averageSynonymsPerWord.toFixed(2)}\n`);
		
		// Test 1: Check if two words are synonyms
		console.log('--- Test 1: Synonym Matching ---');
		const testPairs = [
			['bug', 'issue'],
			['bug', 'error'],
			['topic', 'thread'],
			['help', 'assist'],
			['delete', 'erase'],
			['fast', 'quick'],
			['category', 'section'],
			['bug', 'apple'], // Not synonyms
		];
		
		testPairs.forEach(([word1, word2]) => {
			const areSynonyms = synonyms.areSynonyms(word1, word2);
			console.log(`  "${word1}" ↔ "${word2}": ${areSynonyms ? '✓ SYNONYMS' : '✗ Not synonyms'}`);
		});
		
		// Test 2: Get all synonyms for a word
		console.log('\n--- Test 2: Get All Synonyms ---');
		const wordsToCheck = ['bug', 'help', 'topic', 'fast'];
		wordsToCheck.forEach((word) => {
			const syns = synonyms.getSynonyms(word);
			console.log(`  "${word}": ${syns.join(', ')}`);
		});
		
		// Test 3: Calculate synonym scores
		console.log('\n--- Test 3: Synonym Score Calculation ---');
		
		const searchTerms = ['bug', 'help', 'fast'];
		console.log(`Search Terms: ${searchTerms.join(' ')}\n`);
		
		const testPosts = [
			{
				title: 'Found an issue with the forum',
				content: 'There is a problem that needs assistance. Please resolve quickly.',
			},
			{
				title: 'Error in the system',
				content: 'I discovered a defect and need support. Can someone aid me?',
			},
			{
				title: 'How to configure settings',
				content: 'I want to modify my preferences and change options.',
			},
			{
				title: 'Quick response needed',
				content: 'This is rapid and speedy. Very swift reply.',
			},
		];
		
		console.log('Scoring posts based on synonym matches:\n');
		
		const scoredPosts = testPosts.map((post, idx) => {
			const combinedText = `${post.title} ${post.content}`;
			const details = synonyms.getMatchDetails(searchTerms, combinedText);
			return {
				postNumber: idx + 1,
				title: post.title,
				score: details.score,
				matches: details.matches,
			};
		});
		
		// Sort by score (highest first)
		scoredPosts.sort((a, b) => b.score - a.score);
		
		scoredPosts.forEach((post) => {
			console.log(`Post ${post.postNumber}: "${post.title}"`);
			console.log(`  Synonym Score: ${post.score}`);
			if (post.matches.length > 0) {
				console.log('  Matches:');
				post.matches.forEach((match) => {
					console.log(`    - Search term "${match.searchTerm}" matched "${match.postWord}"`);
				});
			}
			console.log('');
		});
		
		console.log('Posts ranked by synonym score (highest to lowest):');
		scoredPosts.forEach((post, idx) => {
			console.log(`  ${idx + 1}. Post ${post.postNumber}: "${post.title}" (score: ${post.score})`);
		});
		
		// Test 4: Real search example
		console.log('\n--- Test 4: Search Integration Example ---');
		console.log('When searching for "bug fast help":');
		console.log('  - Posts with "issue", "quick", "assist" will rank higher');
		console.log('  - Posts with "error", "rapid", "support" will rank higher');
		console.log('  - Posts with "problem", "swift", "aid" will rank higher');
		console.log('  - Regular keyword matches still work, but synonyms boost ranking\n');
		
		// Test 5: Add custom synonym set
		console.log('--- Test 5: Adding Custom Synonyms ---');
		const customSet = ['nodejs', 'node', 'js', 'javascript'];
		await synonyms.addCustomSynonyms(customSet);
		console.log(`✓ Added custom synonym set: ${customSet.join(', ')}`);
		
		// Verify it works
		const testCustom = synonyms.areSynonyms('nodejs', 'javascript');
		console.log(`  "nodejs" ↔ "javascript": ${testCustom ? '✓ SYNONYMS' : '✗ Not synonyms'}`);
		
		// Show all synonyms for nodejs
		const nodejsSynonyms = synonyms.getSynonyms('nodejs');
		console.log(`  Synonyms for "nodejs": ${nodejsSynonyms.join(', ')}\n`);
		
		// Show updated stats
		const newStats = synonyms.getStats();
		console.log('Updated Statistics:');
		console.log(`  Total Words: ${newStats.totalWords}`);
		console.log(`  Total Synonym Sets: ${newStats.totalSets}\n`);
		
		console.log('✓ All tests completed successfully!');
		console.log('\n=== How It Works ===');
		console.log('Algorithm:');
		console.log('  1. Search terms: a₁, a₂, ..., aₙ (space-separated words)');
		console.log('  2. Post content: P₁, P₂, ..., Pₙ (words from title + content)');
		console.log('  3. For each pair (aᵢ, Pⱼ), check if they are synonyms');
		console.log('  4. Count synonym matches as the score');
		console.log('  5. Sort posts by score (higher score = better rank)');
		console.log('\nBenefits:');
		console.log('  - Users can find posts even if they use different terminology');
		console.log('  - "bug" search finds posts about "issues", "problems", "errors"');
		console.log('  - "help" search finds posts with "assist", "support", "aid"');
		console.log('  - Improves search relevance without exact keyword matching\n');
		
		await db.close();
		
	} catch (error) {
		console.error('\n❌ Error:', error.message);
		console.error(error.stack);
		process.exit(1);
	}
}

// Run the test
testSynonyms();

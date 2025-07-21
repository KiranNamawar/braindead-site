/**
 * Tests for the utility registry system
 */
import { utilityRegistry, getUtilityById, getUtilitiesByCategory, getFeaturedUtilities } from './registry';
import { categories, getCategoryColorClasses } from './categories';
import { UtilitySearchEngine } from './search';
import { UserPreferencesManager } from './preferences';

// Test utility registry structure
console.log('Testing utility registry structure...');
console.assert(utilityRegistry.utilities.length > 0, 'Utility registry should have utilities');
console.assert(Object.keys(utilityRegistry.categories).length === 5, 'Utility registry should have 5 categories');
console.assert(utilityRegistry.featured.length > 0, 'Utility registry should have featured utilities');

// Test utility retrieval functions
console.log('Testing utility retrieval functions...');
const testUtility = getUtilityById('base64-encoder');
console.assert(testUtility?.id === 'base64-encoder', 'Should retrieve utility by ID');

const textUtilities = getUtilitiesByCategory('text');
console.assert(textUtilities.length > 0, 'Should retrieve utilities by category');
console.assert(textUtilities.every(u => u.category === 'text'), 'All utilities should be in the text category');

const featuredUtilities = getFeaturedUtilities();
console.assert(featuredUtilities.length > 0, 'Should retrieve featured utilities');
console.assert(featuredUtilities.every(u => u.featured === true), 'All utilities should be featured');

// Test category color classes
console.log('Testing category color classes...');
const textColorClasses = getCategoryColorClasses('text');
console.assert(textColorClasses.bg.includes('blue'), 'Text category should have blue background');
console.assert(textColorClasses.text.includes('blue'), 'Text category should have blue text');

// Test search engine
console.log('Testing search engine...');
const searchEngine = new UtilitySearchEngine();
const searchResults = searchEngine.search('json');
console.assert(searchResults.length > 0, 'Search should return results for "json"');
console.assert(searchResults[0].utility.id === 'json-formatter', 'First result should be json-formatter');

const suggestions = searchEngine.getSuggestions('base');
console.assert(suggestions.length > 0, 'Should get suggestions for "base"');
console.assert(suggestions[0].text.toLowerCase().includes('base'), 'Suggestions should include "base"');

// Test preferences manager
console.log('Testing preferences manager...');
const preferencesManager = new UserPreferencesManager();
preferencesManager.addRecentlyUsed('json-formatter');
const recentlyUsed = preferencesManager.getRecentlyUsed();
console.assert(recentlyUsed.includes('json-formatter'), 'Recently used should include json-formatter');

preferencesManager.toggleFavorite('base64-encoder');
const favorites = preferencesManager.getFavorites();
console.assert(favorites.includes('base64-encoder'), 'Favorites should include base64-encoder');

console.log('All tests passed!');
# Search Autocomplete Implementation

## Overview
This implementation adds search autocomplete functionality to NodeBB's search bar based on the user's past search history. When a user starts typing in the search bar, a dropdown appears showing their previous searches that match what they've typed so far (prefix match).

## Features Implemented

### 1. Backend API (Database & Endpoints)
- **Database Storage**: User search queries are stored in Redis sorted sets with the key pattern `uid:{uid}:search:history`
- **API Endpoints**:
  - `GET /api/v3/search/history` - Retrieves user's search history
  - `GET /api/v3/search/autocomplete?query=<term>` - Returns prefix-matched suggestions from search history
  - `POST /api/v3/search/history` - Saves a search query to history (called on search submit)
  - `DELETE /api/v3/search/history` - Clears user's search history

### 2. Frontend Integration
- **Autocomplete Dropdown**: Shows filtered search history as user types (1-2 characters trigger autocomplete)
- **Prefix Matching**: Filters search history based on what the user has typed
- **Keyboard Navigation**: 
  - Arrow keys to navigate suggestions
  - Enter to select
  - Escape to close
- **Click Interaction**: Click on a suggestion to perform that search
- **Debouncing**: 300ms debounce to avoid excessive API calls

### 3. Styling
- Custom SCSS styles in `public/scss/modules/search-autocomplete.scss`
- Dark mode support
- Hover and focus states for accessibility
- Consistent with NodeBB's design system

## Files Modified

### Backend Files
1. **src/api/search.js**
   - Added `searchApi.autocomplete()` function for prefix-matched suggestions
   - Existing `searchApi.getHistory()`, `searchApi.saveHistory()`, and `searchApi.clearHistory()` already implemented

2. **src/routes/write/search.js**
   - Added route: `GET /autocomplete` mapped to controller

3. **src/controllers/write/search.js**
   - Added `Search.autocomplete()` controller method

### Frontend Files
1. **public/src/modules/search.js**
   - Modified `showSearchHistory()` function to use autocomplete API when filtering
   - Integrated prefix-match filtering for 1-2 character queries
   - Full search history shown when input is empty

2. **public/scss/modules/search-autocomplete.scss**
   - Already contains styles for search history items
   - Includes hover states and dark mode support

3. **public/scss/client.scss**
   - Already imports the search-autocomplete module

4. **src/views/partials/quick-search-history.tpl**
   - Template for rendering search history dropdown (already exists)

## How It Works

### User Flow
1. User clicks on search bar
2. If empty, shows all recent searches (up to 10)
3. As user types 1-2 characters, autocomplete API filters history with prefix match
4. For 3+ characters, performs full search
5. User can click a suggestion or press Enter to execute that search
6. Search is saved to history when submitted

### Technical Flow
1. **Input Event** → Debounced (300ms) → Check query length
2. **1-2 chars** → Call `/api/v3/search/autocomplete?query=<term>` → Show filtered results
3. **0 chars** → Call `/api/v3/search/history` → Show all history
4. **3+ chars** → Perform full search (existing behavior)
5. **On Submit** → Call `POST /api/v3/search/history` → Save to database

## Database Schema
- **Key**: `uid:{uid}:search:history`
- **Type**: Redis Sorted Set
- **Score**: Timestamp (Date.now())
- **Value**: Search query string
- **Limit**: 10 most recent searches per user

## API Examples

### Get Autocomplete Suggestions
```bash
GET /api/v3/search/autocomplete?query=ep
Response: {
  "suggestions": [
    { "query": "epl", "timestamp": 1708794000000 },
    { "query": "epic games", "timestamp": 1708793000000 }
  ]
}
```

### Get Full History
```bash
GET /api/v3/search/history?limit=10
Response: {
  "searches": [
    { "query": "nodejs", "timestamp": 1708794000000 },
    { "query": "epl", "timestamp": 1708793000000 }
  ]
}
```

## Testing
To test the implementation:
1. Start NodeBB: `./nodebb start`
2. Log in as a user
3. Perform several searches
4. Start typing in the search bar
5. Verify autocomplete suggestions appear
6. Test keyboard navigation and click interactions

## Notes
- Autocomplete only works for logged-in users
- Search history is private to each user
- Maximum 10 searches stored per user
- Prefix matching is case-insensitive
- Integration with existing NodeBB search functionality maintained

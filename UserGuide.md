# 1. User Guide: Polls Feature

## Overview

The Polls feature allows NodeBB users to create polls within forum posts. A poll consists of a title, a question, and two or more options. Other users can cast a single vote per poll, and live vote counts are displayed inline within the post.

---

## How to Use the Polls Feature

### Prerequisites

- You must be logged in to create, view, or vote on polls.
- Polls are embedded inside forum posts. You need permission to create a post in a category to attach a poll.

---

### Creating a Poll

1. Navigate to any forum category and click **New Topic** (or reply to an existing topic).
2. In the post composer, locate the formatting toolbar. You will see a bar chart icon (![poll icon](https://img.shields.io/badge/-📊-lightgrey)) labeled **"Create Poll"**.
3. Click the poll icon. A dialog will appear with the following fields:
   - **Poll Title** — a short name for the poll (required).
   - **Question** — the question you want to ask (required).
   - **Options** — enter each answer option on its own line. At least **two options** are required.
4. Click **Create Poll**. The poll is saved and a `[poll:<id>]` tag is automatically inserted into your post body.
5. Submit your post as normal. The `[poll:<id>]` tag will be rendered as an interactive poll card in the published post.

**Validation rules enforced at creation time:**
- Title must not be empty.
- At least 2 options must be provided.
- Violating either rule will show an error alert and prevent the poll from being created.

---

### Viewing a Poll

When a post containing a `[poll:<id>]` tag is loaded, the poll card is automatically rendered in place of the tag. The card displays:

- The poll title (in the card header).
- The question (as the card title).
- Each option as a list item with the current vote count shown as a badge.

No action is required from the viewer — polls render automatically on page load.

---

### Voting on a Poll

Voting is handled through the REST API. Send a `POST` request to the poll's vote endpoint:

```
POST /api/polls/:pollId/vote
Body: { "optionId": <number> }
```

The `optionId` corresponds to the zero-based index of the option as returned by `GET /api/polls/:pollId`.

**Voting rules:**
- Each user may vote **once per poll**. Attempting to vote a second time returns an error: `"User has already voted"`.
- Voting for an `optionId` that does not exist returns: `"Option not found"`.
- After a successful vote, the poll's `totalVotes` count increments, the chosen option's `votes` count increments, and the response includes `hasVoted: true`.

---

### REST API Reference

All endpoints require authentication.

- `POST /api/polls` — Create a new poll
- `GET /api/polls` — List all polls
- `GET /api/polls/:pollId` — Get a single poll (includes `hasVoted` for current user)
- `POST /api/polls/:pollId/vote` — Cast a vote on a poll
- `DELETE /api/polls/:pollId` — Delete a poll


## Automated Tests

### Location

The automated test suite for the Polls feature is located at:

**[`test/polls.js`](test/polls.js)**

### Running the Tests

```bash
npm run test
```

### What Is Tested

The test suite contains **14 unit tests** covering all backend poll operations using an in-memory database mock.

**`Polls.create()` (4 tests):** Verifies that a poll is created with all correct fields and sequential `optionId`s. Also checks that invalid input — a missing title or fewer than 2 options — throws `"Poll data not valid"`.

**`Polls.get()` (3 tests):** Verifies that a poll can be retrieved by ID with parsed options and a `hasVoted: false` field for a non-voter. Confirms that fetching an unknown ID throws `"Poll not found"`.

**`Polls.getAll()` (1 test):** Verifies that all polls are returned as an array, each with a `hasVoted` field.

**`Polls.vote()` (5 tests):** Verifies that voting increments the option's vote count, `totalVotes`, and sets `hasVoted: true`. Confirms that a second vote by the same user throws `"User has already voted"`, that a different user can vote independently, and that an invalid `optionId` throws `"Option not found"`.

**`Polls.delete()` (1 test):** Verifies that after deletion, fetching the poll throws `"Poll not found"`.

### Why These Tests Are Sufficient

- every backend operation (`create`, `get`, `getAll`, `vote`, `delete`) is exercised.
- each function is tested both for successful operation and for all documented error conditions.
- the vote tests use two distinct user IDs (`uid` and `otherUid`) to verify that per-user vote tracking is isolated correctly.
- the `hasVoted` test after voting confirms that vote state is durably stored, not just returned in-memory from the vote call.
- boundary conditions (missing title, single option, invalid optionId) are explicitly tested to guard against regressions in validation logic.





# 2. User Guide: Search Automplete Implementation

## Overview
This implementation adds search autocomplete functionality to NodeBB's search bar based on the user's past search history. When a user starts typing in the search bar, a dropdown appears showing their previous searches that match what they have typed so far.

## Features Implemeted
- Autocomplete Dropdown: Shows filtered search history as user types
- Prefix Matching: Filters search history based on what the user has typed
- Keyboard Navigaton: Arrow keys to navigate suggestions
-    Enter to select
-    Escape to close
- Click Interaction: Click on a suggestion to perform that search

## Styling
- Custom SCSS styles in public/scss/modules/search-autocomplete.scss
- Dark mode support
- Hover and focus states for accessibility
- Consistent with NodeBB's design system

## Files Modified

### Backend Files
**1. src/api/search.js**
- Added 'searchApi.autocomplete()' function for prefix-matched suggestions
- Existing 'searchApi.getHistory()', 'searchApi.saveHistory()' and 'searchApi.clearHistory()' already implemented

**2. src/routes/write/search.js**
- Added route: 'GET /autocomplete' mapped to controller

3. src/controllers/write/search.js
- Added 'Search.autocomplete()' controlled method

### Frontend Files
**1. public/src/modules/search.js**
- Modified 'searchShowHistory()' function to use autocomplete API when filtering
- Full search history when input is empty

**2. public/scss/modules/search-autocomplete.scss**
- Already contains styles for search history items
- Includes hover states and dark mode support

**3. public/scss/client.scss**
- Already imports the search-autocomplete module

**4. src/views/partials/quick-search-history.tp1**
- Template for rendering search history dropdown (already exists)

## How It Works

### User Flow
1. User clicks on the search bar
2. If empty, shows all recent searches (up to 10)
3. As user types characters, autocomplete API filters history with prefix match
4. User can click a suggestion or press Enter to execute that search
5. Search is saved to history when submitted

### Technical Flow
1. Input Event: Debounced (300ms) > Check query
2. 0 chars: Call /api/v3/search/history > Show all history
3. 1-2 chars: Call /api/v3/search/autocomplete?query=<term> > Show filtered results
4. On Submit: Call 'POST /api/v3/search/history > Save to database

## Database Schema
- Key: uid:<uid>:search:history
- Type: Redis Sorted Set
- Score: Timestamp (Date.now())
- Value: Search query string
- Limit: 10 most recent searches per user

## API Example

### Get Autocomplete Suggestions
```bash
GET /api/v3/search/autocomplete?query=ep
Response: {
"suggestions" [
   {"query": "epl", "timestamp": 1708794000000},
   {"query": "epic games", "timestamp": 1708793000000},
]
}
```
### Get Full History
```bash
GET /api/v3/search/history?limit=10
Response: {
"searches" [
   {"query": "nodejs", "timestamp": 1708794000000},
   {"query": "epl", "timestamp": 1708793000000},
]
}
```

## Testing
### To test the implementation:
1. Start NodeBB: `./nodebb start`
2. Log in as a user
3. Perform several searches
4. Start typing in the search bar
5. Verify autocomplete suggestions appear
6. Test keyboard navigation and click interactions

### Automated Tests
Location: Tests can be found in [`test/search.js`](https:github.com/CMU-313/nodebb-spring-26-unpaid-interns/blob/main/test/search.js)

What is being Tested
**Search History Tests**
- Saving search queries to a user's history
- Loading history in most-recent-first order
- Re-searching a query moves it to the top of the history
- Hiistory is capped at 10 entries, with the oldest removed when the limit is exceeded
- Clearing a user's search history

**Search Autocomplete Tests**
- Returning suggestions that match a given prefix (eg: typing "ep" suggests "epl")
- Suggestions are ordered by most recent first
- The limit parameter correctly restricts the number of results returned
- Prefix matching is case insensitive (eg: "node", "NODE" and "NoDe" return same results)
- An empty query returns no suggestions
- Users only see autocomplete suggestions from their own search history, not other users'

## General Notes
- Autocomplete only works for logged-in users
- Search history is private to each user
- Maximum 10 searches stored per user
- Prefix matching is case-insensitive
- Integration with existing NodeBB search functionality maintained



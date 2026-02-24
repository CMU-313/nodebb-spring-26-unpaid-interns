# Inline Autocomplete Feature (Google-style)

## Overview
This feature adds inline autocomplete to the search bar, similar to Google's search functionality. When a user types a partial query that matches their search history, the full suggestion appears as "ghost text" directly in the search input field. The user can accept the suggestion by pressing Tab or Right Arrow, or continue typing to ignore it.

## Feature Description

### User Experience
1. User types in the search bar (e.g., "ep")
2. If the user has previously searched for "epl", the remaining text "l" appears as gray ghost text in the search bar: "ep**l**"
3. User can:
   - Press **Tab** or **Right Arrow** to accept the suggestion and complete the text
   - Press **Enter** to search with the current text (without accepting the suggestion)
   - Continue typing to ignore the suggestion

### Example Flow
```
User types: "e"
Ghost text shows: "epl" (if "epl" is in search history)

User types: "ep"
Ghost text shows: "epl" (showing "l" as the remaining text)

User presses Tab:
Input becomes: "epl" (suggestion accepted)

OR

User continues typing: "epi"
Ghost text disappears (no match)
```

## Implementation Details

### Frontend Changes

#### File: `public/src/modules/search.js`

**New Function: `setupInlineAutocomplete(inputEl)`**
- Creates a ghost text element positioned over the input field
- Fetches search history suggestions from the autocomplete API
- Updates ghost text based on user input (1-2 characters only)
- Handles keyboard events (Tab/Right Arrow to accept)
- Debounces API calls (150ms) for performance

**Key Features:**
- **Ghost Text Element**: A `<span>` element with gray text positioned absolutely over the input
- **Prefix Matching**: Only shows suggestions that start with what the user typed (case-insensitive)
- **Smart Triggering**: Only active for 1-2 character queries (to avoid interfering with full search)
- **Keyboard Handling**:
  - `Tab` or `Right Arrow`: Accept the inline suggestion
  - Any other key: Continue typing normally
- **Auto-cleanup**: Ghost text disappears when input is empty, has 3+ characters, or on blur

### Styling

#### File: `public/scss/modules/search-autocomplete.scss`

**Ghost Text Styles:**
```scss
.search-ghost-text {
  color: #999 !important;
  user-select: none;
}

[data-bs-theme="dark"] {
  .search-ghost-text {
    color: #666 !important;
  }
}
```

- Gray color (#999 in light mode, #666 in dark mode)
- Non-selectable (user-select: none)
- Positioned absolutely to overlay the input field
- Matches input font family, size, and line height

### Backend Integration

The feature uses the existing autocomplete API endpoint:
- **Endpoint**: `GET /api/v3/search/autocomplete?query=<term>`
- **Response**: Returns search history items that match the prefix
- **Limit**: Fetches up to 10 suggestions, uses the first match for inline display

## Behavior Details

### When Inline Autocomplete is Active
- **Query length**: 1-2 characters only
- **User is logged in**: Required (search history is user-specific)
- **Match found**: At least one search history item starts with the typed text

### When Inline Autocomplete is Inactive
- **Query length**: 0 characters (empty) or 3+ characters (full search mode)
- **No match**: No search history items match the prefix
- **User not logged in**: Feature disabled
- **Input loses focus**: Ghost text is cleared

### Interaction with Existing Features
- **Dropdown History**: Still shows below the search bar (unchanged)
- **Full Search**: Activates at 3+ characters (unchanged)
- **Search History Saving**: Still saves searches on submit (unchanged)
- **Keyboard Navigation**: Tab/Right Arrow are captured only when ghost text is visible

## Technical Specifications

### Debouncing
- **Inline autocomplete**: 150ms debounce
- **Dropdown history**: 300ms debounce (existing)

### API Calls
- Inline autocomplete makes separate API calls to `/search/autocomplete`
- Only triggers for 1-2 character queries
- Reuses existing backend infrastructure

### Performance Considerations
- Ghost text element is created once and reused
- API calls are debounced to reduce server load
- Minimal DOM manipulation (only updating text content)

## Testing Instructions

1. **Start NodeBB**: `./nodebb start`
2. **Log in** as a user
3. **Perform searches**: Search for terms like "epl", "epic", "example"
4. **Test inline autocomplete**:
   - Type "e" → Should show "epl" or "epic" as ghost text
   - Type "ep" → Should show "epl" or "epic" as ghost text
   - Press Tab → Should accept the suggestion
   - Type "epi" → Ghost text should disappear if no match
5. **Test keyboard shortcuts**:
   - Tab: Accept suggestion
   - Right Arrow: Accept suggestion
   - Enter: Search without accepting suggestion
   - Any other key: Continue typing normally
6. **Test edge cases**:
   - Empty input → No ghost text
   - 3+ characters → No ghost text (full search mode)
   - No match → No ghost text
   - Blur input → Ghost text disappears

## Browser Compatibility

- Modern browsers with ES6+ support
- Tested with Chrome, Firefox, Safari, Edge
- Requires JavaScript enabled
- Works with both light and dark themes

## Accessibility

- Ghost text is non-interactive (pointer-events: none)
- Ghost text is not selectable (user-select: none)
- Keyboard navigation is intuitive (Tab/Right Arrow)
- Visual distinction (gray color) makes it clear it's a suggestion
- Does not interfere with screen readers (ghost text is decorative)

## Future Enhancements

Potential improvements for future iterations:
1. Support for multiple suggestions (cycle through with Tab)
2. Configurable debounce timing
3. User preference to enable/disable inline autocomplete
4. Analytics to track acceptance rate
5. Support for fuzzy matching (not just prefix)

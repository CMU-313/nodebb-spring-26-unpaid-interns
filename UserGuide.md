# User Guide: Polls Feature

## Overview

The Polls feature allows NodeBB users to create polls within forum posts. A poll consists of a title, a question, and two or more options. Students can cast a single vote per poll and change their vote while the poll is open. Poll creators (instructors) see a detailed analytics view with vote counts and percentages per option, and can close the poll to freeze results.

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

When a post containing a `[poll:<id>]` tag is loaded, the poll card is automatically rendered in place of the tag.

**Students** see:
- The poll title and question.
- A voting form with radio buttons if they have not yet voted.
- Vote counts per option (as badges) after voting.
- A **Change Vote** button to switch their selection while the poll is open.

**Instructors (poll creators)** see:
- Vote counts and percentage per option with a progress bar for each.
- A **Close Poll** button while the poll is open.
- A **Closed** badge in the poll header once the poll has been closed.

No action is required to render the poll — it loads automatically on page load.

---

### Voting on a Poll

1. Open a post containing a poll. If you have not voted yet, you will see a list of radio button options and a **Vote** button.
2. Select one option and click **Vote**. The poll re-renders to show the current vote counts.
3. To change your vote, click **Change Vote**, select a different option, and click **Vote** again.

**Voting rules:**
- You must be logged in to vote.
- Each user may vote once per poll, but can change their vote at any time while the poll is open.
- Voting or changing a vote on a closed poll is not allowed.
- Poll creators do not see the voting form — they see the analytics view instead.

Voting can also be triggered directly via the REST API:

```
POST /api/polls/:pollId/vote
Body: { "optionId": <number> }
```

---

### Closing a Poll (Instructors Only)

Poll creators can close a poll to prevent further votes and freeze the results.

1. Open the post containing your poll.
2. Click the **Close Poll** button at the bottom of the poll card.
3. The poll re-renders with a **Closed** badge in the header. Voting is disabled for all users.

Closing can also be triggered via the REST API:

```
POST /api/polls/:pollId/close
```

**Rules:**
- Only the poll creator can close a poll.
- A poll cannot be closed more than once.

---

### REST API Reference

All endpoints require authentication.

- `POST /api/polls` — Create a new poll
- `GET /api/polls` — List all polls
- `GET /api/polls/:pollId` — Get a single poll (includes `hasVoted`, `isCreator`, `isClosed`, and `percentage` per option)
- `POST /api/polls/:pollId/vote` — Cast or change a vote
- `POST /api/polls/:pollId/close` — Close a poll (creator only)
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

The test suite contains **22 unit tests** covering all backend poll operations using an in-memory database mock.

**`Polls.create()` (4 tests):** Verifies that a poll is created with all correct fields and sequential `optionId`s. Also checks that invalid input — a missing title or fewer than 2 options — throws `"Poll data not valid"`.

**`Polls.get()` (6 tests):** Verifies that a poll can be retrieved by ID with parsed options, a `hasVoted: false` field for a non-voter, `isCreator: true` for the creator and `false` for others, and `percentage: 0` on all options before any votes are cast. Confirms that fetching an unknown ID throws `"Poll not found"`.

**`Polls.getAll()` (1 test):** Verifies that all polls are returned as an array, each with a `hasVoted` field.

**`Polls.vote()` (7 tests):** Verifies that voting increments the option's vote count, `totalVotes`, and sets `hasVoted: true`. Confirms that a user can change their vote (decrementing the old option and incrementing the new one without changing `totalVotes`), that voting for the same option twice is a no-op, that a different user can vote independently, that percentages are correct after voting, and that an invalid `optionId` throws `"Option not found"`.

**`Polls.close()` (4 tests):** Verifies that the creator can close a poll, that voting on a closed poll throws `"Poll is closed"`, that closing an already-closed poll throws `"Poll is already closed"`, and that a non-creator attempting to close throws `"Only the poll creator"`.

**`Polls.delete()` (1 test):** Verifies that after deletion, fetching the poll throws `"Poll not found"`.

### Why These Tests Are Sufficient

- Every backend operation (`create`, `get`, `getAll`, `vote`, `close`, `delete`) is exercised.
- Each function is tested for both successful operation and all documented error conditions.
- The vote tests use two distinct user IDs to verify that per-user vote tracking is isolated correctly.
- The `isCreator` and `percentage` tests confirm that the analytics fields are computed correctly and are not just returned in-memory.
- Boundary conditions (missing title, single option, invalid optionId, non-creator close) are explicitly tested to guard against regressions.

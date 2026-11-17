# Session figures

The front page's token, cost and time figures come from the two files here. `site/scripts/migration-stats.mjs` turns them into the session block of `site/data/migration.json`, and CI checks that block against them with `node site/scripts/migration-stats.mjs verify`.

## When they are refreshed

The agent refreshes all of them as the last commit of each pull request, before it is marked ready, so each release carries the figures up to that point:

```sh
node site/scripts/migration-stats.mjs refresh get_session.json transcript.jsonl
```

That runs the `usage`, `daily` and `session` steps below, then `verify`. The pull request template has a box for it.

## `usage.json`

The token counts and cost come from the Claude Code session API. The agent calls `get_session`, the `claude-code-remote` tool that describes its own session, with no arguments. It saves the response, then runs:

```sh
node site/scripts/migration-stats.mjs usage get_session.json
```

The script copies five numbers from the response's `external_metadata.usage`, and records when they were fetched:

| Field in `usage.json` | Field in the response | What it counts |
|---|---|---|
| `inputTokens` | `input_tokens` | Input tokens not read from the prompt cache |
| `outputTokens` | `output_tokens` | Tokens the model wrote |
| `cacheReadTokens` | `cache_read_tokens` | Input tokens read from the prompt cache |
| `cacheWriteTokens` | `cache_write_tokens` | Input tokens written to the prompt cache |
| `costUsd` | `cost_usd` | The session's cost at list prices, rounded to the cent |

Nothing else from the response is kept: no session or account IDs, no environment details, no message text. These numbers can't be checked beyond the API's word, but every refresh is a commit, so their history is in git.

## `daily.csv`

One line per UTC day of the session, totalled from the agent's transcript, so the file grows by a line a day rather than a line an event. It holds no message text. The agent writes it from its transcript with:

```sh
node site/scripts/migration-stats.mjs daily transcript.jsonl
```

| Column | What it holds |
|---|---|
| `date` | The UTC day |
| `first`, `last` | The day's first and last event |
| `events` | How many events the transcript has that day: messages, the agent's steps, tool results and CI notices |
| `agentSeconds` | **Agent working time:** the gaps of 5 minutes or less between consecutive events, so waits for CI or the reviewer aren't counted |
| `reviewerSeconds` | **Reviewer time:** the gaps of 15 minutes or less between the reviewer's own messages. The reviewer is Betsalel Williamson, who runs this edition, not the ncurses maintainer |
| `reviewerMessages` | The reviewer's messages |

A gap belongs to the day of the event that ends it. The front page's time figures are the sums of the columns, and **wall time** runs from the first day's `first` to the last day's `last`.

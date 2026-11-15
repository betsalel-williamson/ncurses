# Session figures

The front page's token, cost and time figures come from the two files here. `site/scripts/migration-stats.mjs` turns them into the session block of `site/data/migration.json`, and CI checks that block against them with `node site/scripts/migration-stats.mjs verify`.

## When they are refreshed

The agent refreshes all of them as the last commit of each pull request, before it is marked ready, so each release carries the figures up to that point:

```sh
node site/scripts/migration-stats.mjs refresh get_session.json transcript.jsonl
```

That runs the `usage`, `timeline` and `session` steps below, then `verify`. The pull request template has a box for it.

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

## `timeline.csv`

Each line is one event in the agent's transcript: its time, and whether the maintainer wrote it (`maintainer`) or anything else did (`agent`, which also covers tool results and CI notices). It holds no message text. The agent writes it from its transcript with:

```sh
node site/scripts/migration-stats.mjs timeline transcript.jsonl
```

The time figures are recomputed from it:

- **Agent working time** adds the gaps of 5 minutes or less between consecutive events, so waits for CI or the maintainer aren't counted.
- **Maintainer time** adds the gaps of 15 minutes or less between the maintainer's own messages.
- **Wall time** runs from the first event to the last.

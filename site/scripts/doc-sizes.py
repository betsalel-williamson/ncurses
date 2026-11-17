"""Measure the documentation before the migration and now, in words and in tokens.

Usage (from the repository root, with tiktoken and tokenizers installed):
    python3 -I site/scripts/doc-sizes.py TOKDIR

TOKDIR holds the open tokenizer files llama3.json, gemma3.json and claude.json:
    curl -sSfL -o TOKDIR/llama3.json https://huggingface.co/NousResearch/Meta-Llama-3-8B/resolve/main/tokenizer.json
    curl -sSfL -o TOKDIR/gemma3.json https://huggingface.co/unsloth/gemma-3-4b-it/resolve/main/tokenizer.json
    curl -sSfL -o TOKDIR/claude.json https://huggingface.co/Xenova/claude-tokenizer/resolve/main/tokenizer.json

Writes site/data/doc-sizes.json, which the front page reads. "Before" is the upstream snapshot the
migration started from (the first parent of the first merge); "now" is HEAD. Each side is the
files as stored, read whole, the way a reader or an agent would load them.
"""
import json, os, re, subprocess, sys

import tiktoken
from tokenizers import Tokenizer

TOK = sys.argv[1]
OUT = "site/data/doc-sizes.json"


def git(*args):
    return subprocess.run(["git", *args], check=True, capture_output=True).stdout


first_merge = git("log", "--first-parent", "--reverse", "--format=%H %s", "HEAD").decode().splitlines()
first_merge = next(l.split()[0] for l in first_merge if re.search(r" Merge pull request #\d+ ", " " + l.split(" ", 1)[1]))
BEFORE = git("rev-parse", f"{first_merge}^1").decode().strip()
NOW = git("rev-parse", "HEAD").decode().strip()
MAN_PAGE = re.compile(r"^man/[^/]+\.[1-9][a-z]*$")


def files(commit):
    return git("ls-tree", "-r", "--name-only", commit).decode().splitlines()


def under(names, *prefixes):
    return [f for f in names if any(f == p or f.startswith(p.rstrip("/") + "/") for p in prefixes)]


# The tracks of the front page: what each started from, and the shards that replaced it.
GROUPS = [
    {
        "name": "Guides",
        "before": lambda fs: ["doc/html/NCURSES-Programming-HOWTO.html", "doc/html/ncurses-intro.html"],
        "now": lambda fs: under(fs, "docs/client-library", "docs/appendix/references.md"),
        "from": "NCURSES Programming HOWTO and Writing Programs with NCURSES (HTML)",
    },
    {
        "name": "Manual pages",
        "before": lambda fs: [f for f in fs if MAN_PAGE.match(f)],
        "now": lambda fs: under(fs, "docs/man"),
        "from": "man/ (troff)",
    },
    {
        "name": "Contributor and install docs",
        "before": lambda fs: [
            "doc/html/hackguide.html", "INSTALL", "README", "README.MinGW", "README.emx",
            "doc/html/Ada95.html", "Ada95/README", "Ada95/samples/README", "announce.html.in",
        ],
        "now": lambda fs: under(fs, "docs/contributor"),
        "from": "hackguide.html, INSTALL and READMEs, Ada95.html, announce.html.in",
    },
]

o200k = tiktoken.get_encoding("o200k_base")
hf = {k: Tokenizer.from_file(os.path.join(TOK, f"{k}.json")) for k in ("llama3", "gemma3", "claude")}
for t in hf.values():
    t.no_padding()
    t.no_truncation()

TOKENIZERS = [
    {"id": "o200k", "name": "OpenAI o200k", "note": "Exact for GPT-4o, GPT-4.1, the o-series and GPT-5."},
    {"id": "claude", "name": "Claude (published tokenizer)", "note": "Anthropic's published tokenizer is the Claude 1 and 2 one. Newer Claude models use another, so this is an estimate."},
    {"id": "llama3", "name": "Llama 3", "note": "Exact for Llama 3 to 3.3."},
    {"id": "gemma3", "name": "Gemma 3", "note": "Exact for Gemma 3; Gemini is close."},
]


def words(text):
    # Markup isn't words: tags, entities, troff requests and comments are dropped first.
    t = re.sub(r"<[^>]*>", " ", text)
    t = re.sub(r"&[#\w]+;", " ", t)
    t = re.sub(r"^[.'][ \t]*\\\".*$", "", t, flags=re.M)
    t = re.sub(r"^[.'][ \t]*\S+", "", t, flags=re.M)
    return sum(1 for w in t.split() if re.search(r"\w", w))


def measure(commit, names):
    m = {"files": len(names), "bytes": 0, "words": 0, **{t["id"]: 0 for t in TOKENIZERS}}
    for name in names:
        raw = git("show", f"{commit}:{name}")
        text = raw.decode("utf-8", errors="replace")
        m["bytes"] += len(raw)
        m["words"] += words(text)
        m["o200k"] += len(o200k.encode(text, disallowed_special=()))
        for k, t in hf.items():
            m[k] += len(t.encode(text, add_special_tokens=False).ids)
    return m


def snapshot_label(commit):
    # Upstream snapshots are titled 'snapshot of project "ncurses", label v6_6_20261107'.
    subject = git("log", "-1", "--format=%s", commit).decode().strip()
    m = re.search(r"label (\S+)", subject)
    return m.group(1) if m else commit[:12]


before_files, now_files = files(BEFORE), files(NOW)
groups = []
for g in GROUPS:
    groups.append({
        "name": g["name"],
        "from": g["from"],
        "before": measure(BEFORE, g["before"](before_files)),
        "now": measure(NOW, g["now"](now_files)),
    })

out = {
    "about": "Sizes of the documentation before the migration and now, by site/scripts/doc-sizes.py.",
    "before": {"commit": BEFORE[:12], "label": snapshot_label(BEFORE)},
    "now": {"commit": NOW[:12]},
    "tokenizers": TOKENIZERS,
    "groups": groups,
}
with open(OUT, "w") as f:
    json.dump(out, f, indent=1)
    f.write("\n")
for g in groups:
    print(f"{g['name']}: {g['before']['files']} files, {g['before']['o200k']} tokens -> {g['now']['files']} files, {g['now']['o200k']} tokens")

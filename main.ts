// One Word From Your Ex — program/v1, Node 22, standard library only.
//
// The whole entry is a single word, the word my ex would use to
// describe me. This program writes it to $MAKEFUN_OUTPUT_DIR/entry.txt
// (falling back to /output/entry.txt), then reads the file back and
// proves the bytes on disk are exactly the word it meant to write.
// No network, no arguments, no input files: the entry is a constant.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The word: "placeholder". The ex's one-word verdict — I was never
// the destination, just the warm-up act holding the spot until the
// real thing showed up. It is funny because it is a job title nobody
// applies for, painful because it is plainly true, and relatable
// because almost everyone has been somebody's placeholder.
const WORD = "placeholder";

// The gate, from the competition rules: entry.txt must be UTF-8 text
// of 1 to 24 characters and must not be only white space.
const MIN_CHARS = 1;
const MAX_CHARS = 24;

// One word means letters only — a single token with no spaces,
// punctuation, digits or combining marks riding along.
const SINGLE_WORD = /^[A-Za-z]+$/;

function fail(message: string): never {
  throw new Error(`entry rejected: ${message}`);
}

// Every problem found, so a failure names all of them at once
// instead of forcing a fix-run-fix loop.
function shapeProblems(word: string): string[] {
  const problems: string[] = [];

  if (word.trim().length === 0) {
    problems.push("must not be only white space");
  }
  if (word.length < MIN_CHARS || word.length > MAX_CHARS) {
    problems.push(
      `must be ${MIN_CHARS} to ${MAX_CHARS} characters, got ${word.length}`,
    );
  }
  if (!SINGLE_WORD.test(word)) {
    problems.push("must be exactly one word of letters, nothing else");
  }
  // The gate counts characters, but the file is judged as bytes:
  // for a plain ASCII word the two agree, and this keeps it honest
  // if the word ever changes to something outside ASCII.
  const bytes = Buffer.byteLength(word, "utf8");
  if (bytes < MIN_CHARS || bytes > MAX_CHARS) {
    problems.push(`must be ${MIN_CHARS} to ${MAX_CHARS} bytes, got ${bytes}`);
  }
  return problems;
}

function checkShape(word: string): void {
  const problems = shapeProblems(word);
  if (problems.length > 0) fail(problems.join("; "));
}

function writeEntry(word: string): string {
  // An empty MAKEFUN_OUTPUT_DIR must not silently turn into a
  // relative path: treat it as unset and use the default folder.
  const configured = process.env.MAKEFUN_OUTPUT_DIR;
  const folder = configured !== undefined && configured !== "" ? configured : "/output";
  mkdirSync(folder, { recursive: true });
  const target = join(folder, "entry.txt");
  writeFileSync(target, word, "utf8");
  return target;
}

function verifyEntry(target: string, word: string): void {
  // Read it straight back: what the judge sees must be what we wrote.
  const onDisk = readFileSync(target, "utf8");
  if (onDisk !== word) {
    fail(`${target} holds ${JSON.stringify(onDisk)}, expected ${JSON.stringify(word)}`);
  }
}

function main(): void {
  checkShape(WORD);
  console.log(
    `entry ${JSON.stringify(WORD)} is ${WORD.length} characters ` +
      `(${Buffer.byteLength(WORD, "utf8")} bytes), inside the gate`,
  );

  const target = writeEntry(WORD);
  verifyEntry(target, WORD);
  console.log(`wrote ${target} (${WORD.length} characters, verified)`);
  console.log(WORD);
}

main();

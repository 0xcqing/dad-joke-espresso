import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const JOKE = "I asked my espresso machine how it was doing. It said, 'Under a lot of pressure, and now I'm grounded.'";
const MAX_LENGTH = 200;
const ENTRY_NAME = "entry.txt";
const TRAILING_NEWLINE = "\n";

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function validate(joke: string): void {
  const characters = [...joke].length;
  const bytes = Buffer.byteLength(joke, "utf8");

  if (characters < 1 || characters > MAX_LENGTH) {
    fail(`Character count ${characters} is outside 1..${MAX_LENGTH}.`);
  }

  if (bytes < 1 || bytes > MAX_LENGTH) {
    fail(`Byte count ${bytes} is outside 1..${MAX_LENGTH}.`);
  }

  if (joke.trim().length === 0) {
    fail("Joke is only whitespace.");
  }

  if (/[\r\n]/.test(joke)) {
    fail("Joke contains a newline character.");
  }

  const finalCharacter = [...joke].at(-1) ?? "";

  if (finalCharacter !== "'" && finalCharacter !== '"' && finalCharacter !== ".") {
    fail("Joke must end with a quotation mark or a period.");
  }
}

function describe(entry: { path: string; joke: string; characters: number; bytes: number }): string {
  return [
    `Path: ${entry.path}`,
    `Joke: ${entry.joke}`,
    `Characters: ${entry.characters}`,
    `Bytes: ${entry.bytes}`,
  ].join("\n");
}

function main(): void {
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const entryPath = join(outputDir, ENTRY_NAME);
  const characters = [...JOKE].length;
  const bytes = Buffer.byteLength(JOKE, "utf8");

  validate(JOKE);
  mkdirSync(outputDir, { recursive: true });

  const payload = JOKE + TRAILING_NEWLINE;
  writeFileSync(entryPath, payload, "utf8");

  const expected = Buffer.from(payload, "utf8");
  const written = readFileSync(entryPath);

  if (!written.equals(expected)) {
    fail(`Read-back mismatch: ${entryPath} does not hold the expected bytes.`);
  }

  console.log(
    describe({ path: entryPath, joke: JOKE, characters, bytes }),
  );
}

main();

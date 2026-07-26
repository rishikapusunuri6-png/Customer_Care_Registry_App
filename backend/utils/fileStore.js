const fs = require("fs/promises");
const path = require("path");

// Serializes read-modify-write operations per file so concurrent requests
// can't interleave and corrupt the JSON file (no DB transactions here).
const locks = new Map();

const withLock = async (filePath, task) => {
  const previous = locks.get(filePath) || Promise.resolve();
  let release;
  const current = new Promise((resolve) => {
    release = resolve;
  });
  locks.set(filePath, previous.then(() => current));

  await previous;
  try {
    return await task();
  } finally {
    release();
    if (locks.get(filePath) === current) {
      locks.delete(filePath);
    }
  }
};

// Reads and parses a JSON file. If it doesn't exist yet, creates it with
// defaultData and returns that instead.
const readJSON = async (filePath, defaultData) => {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return raw.trim() ? JSON.parse(raw) : defaultData;
  } catch (error) {
    if (error.code === "ENOENT") {
      await writeJSON(filePath, defaultData);
      return defaultData;
    }
    throw error;
  }
};

// Writes data to a JSON file, pretty-printed. Creates parent folder if needed.
const writeJSON = async (filePath, data) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
};

// Read-modify-write in one locked step. `updater` receives the parsed data,
// mutates it in place (or returns a replacement), and the result is persisted.
// Returns whatever `updater` returns, so callers can hand back the created/
// updated record.
const updateJSON = (filePath, defaultData, updater) =>
  withLock(filePath, async () => {
    const data = await readJSON(filePath, defaultData);
    const result = await updater(data);
    await writeJSON(filePath, data);
    return result;
  });

module.exports = { readJSON, writeJSON, updateJSON };

const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");
const { runInNewContext } = require("node:vm");
const ts = require("typescript");

const source = ts.transpileModule(
  readFileSync(join(__dirname, "../src/lib/supabase.ts"), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } },
).outputText;

function fixture(initialOwner) {
  let owner = initialOwner;
  const writes = [];
  const acknowledgements = [];
  const exports = {};
  const deps = {
    "react-native-url-polyfill/auto": {},
    "expo-secure-store": {},
    "expo-constants": { expoConfig: { extra: { supabaseUrl: "https://sync.test", supabasePublishableKey: "fixture" } } },
    "@/lib/local-db": {
      markActivitySynced: (...args) => acknowledgements.push(args),
      markTemplateSynced: (...args) => acknowledgements.push(args),
      replaceTemplateFromServer: () => assert.fail("No server templates in this fixture"),
    },
    "@supabase/supabase-js": {
      createClient(_url, _key, options) {
        if (!options.accessToken) {
          return { auth: { getSession: async () => ({
            data: { session: { user: { id: owner }, access_token: "session-" + owner } },
          }) } };
        }
        return {
          from(table) {
            if (table === "sweatline_runs") {
              return { upsert: async (row) => {
                writes.push([table, await options.accessToken(), row.user_id]);
                owner = "B"; // A different session becomes active while A syncs.
                return { error: null };
              } };
            }
            assert.equal(table, "sweatline_templates");
            return { select: () => ({ eq: (column, value) => {
              assert.equal(column, "user_id");
              assert.equal(value, "A");
              return { order: async () => ({ data: [], error: null }) };
            } }) };
          },
          async rpc(_name, row) {
            writes.push(["template", await options.accessToken(), row.template_id]);
            return { error: null };
          },
        };
      },
    },
  };
  runInNewContext(source, { exports, require: (id) => deps[id] });
  return { sync: exports.syncAccount, writes, acknowledgements };
}

const activity = { id: "run-a", userId: "A", kind: "run", title: "Test run", payload: {} };
const template = { id: "template-a", userId: "A", clientUpdatedAt: "2026-01-01T00:00:00Z" };

test("sync keeps writes and acknowledgements bound to the original account", async () => {
  const { sync, writes, acknowledgements } = fixture("A");
  await sync("A", [activity], [template]);
  assert.deepEqual(writes, [
    ["sweatline_runs", "session-A", "A"],
    ["template", "session-A", "template-a"],
  ]);
  assert.deepEqual(acknowledgements, [
    ["run-a", "A"],
    ["template-a", "A", template.clientUpdatedAt],
  ]);
});

test("a stale account or mismatched local record never starts a cloud write", async () => {
  const stale = fixture("B");
  await assert.rejects(stale.sync("A", [activity], [template]), /Account changed/);
  assert.deepEqual(stale.writes, []);

  const mismatched = fixture("A");
  await assert.rejects(mismatched.sync("A", [activity], [{ ...template, userId: "B" }]), /Account changed/);
  assert.deepEqual(mismatched.writes, []);
});

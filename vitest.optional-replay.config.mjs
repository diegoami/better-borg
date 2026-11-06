import { defineConfig } from "vitest/config";
import base, { OPTIONAL_REPLAY_TESTS } from "./vitest.config.mjs";
export default defineConfig({
  ...base,
  test: {
    ...base.test,
    include: OPTIONAL_REPLAY_TESTS,
    exclude: base.test.exclude.filter(path => !OPTIONAL_REPLAY_TESTS.includes(path)),
  },
});

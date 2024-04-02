import { assert, assertEquals } from "std/assert/mod.ts";
import { convertToSearchParams, getRaw, splitter } from "./utils.ts";

Deno.test("Should get params from string", () => {
  const expected = "?foo=1&bar=2";

  assertEquals(getRaw(new URLSearchParams(expected)), expected);
  assertEquals(getRaw(new URL(`http://site.com${expected}`)), expected);
  assertEquals(getRaw(`http://site.com${expected}`), expected);
  assertEquals(getRaw("http://site.com"), "");
});

Deno.test("Should convert URL to URLSearchParams", () => {
  assert(
    convertToSearchParams(new URL("http://site.com")) instanceof URLSearchParams
  );
  assert(convertToSearchParams("http://site.com") instanceof URLSearchParams);
});

Deno.test("Should split string", () => {
  // Additional coverage in 'mapper.test.ts' toArray tests
  assertEquals(splitter([","], "1,2", false), ["1", "2"]);
});

import { assert } from "std/assert/assert.ts";
import { assertEquals } from "std/assert/assert_equals.ts";
import { safeQueries } from "./safe-queries.ts";
import { Schema } from "./types.ts";

Deno.test("Should return null if no query string ", () => {
  const queries = safeQueries("http://grafluxe.com");

  assertEquals(queries, {
    raw: "",
    param: {},
    error: {
      noQueryString: true,
    },
  });
});

Deno.test("Should concat repeating params ", () => {
  const { param } = safeQueries("http://grafluxe.com?t=1&t=2");

  assertEquals(param.t, ["1", "2"]);
});

Deno.test("Should concat repeating foreign params ", () => {
  const { foreign } = safeQueries("http://grafluxe.com?t=1&t=2", {});

  assertEquals(foreign?.t, ["1", "2"]);
});

Deno.test("Should flag duplicate params ", () => {
  const { duplicate } = safeQueries("http://grafluxe.com?t=1&t=2", {});

  assertEquals(duplicate, ["t"]);
});

Deno.test("Should return query string from 'raw' property", () => {
  const expected = "?bar&t=1&foo";

  const str = "http://site.com?bar&t=1&foo";
  const url = new URL("http://site.com?bar&t=1&foo");
  const searchParams1 = new URLSearchParams("?bar&t=1&foo");
  const searchParams2 = new URLSearchParams({ bar: "", t: "1", foo: "" });
  const searchParams3 = new URLSearchParams([
    ["bar", ""],
    ["t", "1"],
    ["foo", ""],
  ]);

  assertEquals(safeQueries(str).raw, expected);
  assertEquals(safeQueries(url).raw, expected);
  assertEquals(safeQueries(searchParams1).raw, expected);
  assertEquals(safeQueries(searchParams2).raw, expected);
  assertEquals(safeQueries(searchParams3).raw, expected);
});

Deno.test("Should be required", () => {
  const schema: Schema = {
    foo: {
      required: true,
    },
  };
  const { error } = safeQueries("http://site.com?bar", schema);

  assert(error);
  assertEquals(error, { requiredKeys: ["foo"] });
});

Deno.test("Should map type", () => {
  const schema: Schema = {
    foo: {
      map: (val: string) => Number(val),
    },
  };
  const { param } = safeQueries("http://site.com?foo", schema);

  assertEquals(typeof param.foo, "number");
});

Deno.test("Should be invalid", () => {
  const schema: Schema = {
    foo: {
      validate: () => false,
    },
  };
  const { error } = safeQueries("http://site.com?foo", schema);

  assertEquals(error?.invalidKeys, ["foo"]);
});

Deno.test("Should be invalid after map", () => {
  type Params = { foo: number };

  const schema: Schema<Params> = {
    foo: {
      map: (val: string) => Number(val),
      validate: (val: number) => val > 10,
    },
  };
  const { error } = safeQueries("http://site.com?foo=1", schema);

  assertEquals(error?.invalidKeys, ["foo"]);
});

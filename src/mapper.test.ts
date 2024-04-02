import { assertEquals } from "std/assert/mod.ts";
import { toArray, toBoolean, toNumber } from "./mapper.ts";

Deno.test("Should map to number", () => {
  assertEquals(toNumber("1"), 1);
});

Deno.test("Should map invalid number to NaN", () => {
  assertEquals(toNumber("a"), NaN);
});

Deno.test("Should map to boolean", () => {
  assertEquals(toBoolean("true"), true);
  assertEquals(toBoolean("false"), false);
});

Deno.test("Should map empty string to true", () => {
  assertEquals(toBoolean(""), true);
});

Deno.test("Should map to null if invalid boolean", () => {
  assertEquals(toBoolean("t"), null);
  assertEquals(toBoolean("1"), null);
  assertEquals(toBoolean("0"), null);
});

Deno.test("Should map to string array", () => {
  assertEquals(toArray("")("1"), ["1"]);
  assertEquals(toArray(",")("1,2"), ["1", "2"]);
  assertEquals(toArray(";")("1;2"), ["1", "2"]);
  assertEquals(toArray(",")(","), ["", ""]);
  assertEquals(toArray("")(""), []);
});

Deno.test("Should map to nested string array", () => {
  assertEquals(toArray([",", ":"])("1:2,hi:true,99"), [
    ["1", "2"],
    ["hi", "true"],
    "99",
  ]);

  assertEquals(toArray(["&", ";", ":"])("1:x:1;2:x:2&debug"), [
    [
      ["1", "x", "1"],
      ["2", "x", "2"],
    ],
    "debug",
  ]);
});

Deno.test("Should map to coerced array", () => {
  assertEquals(toArray("", true)("1"), [1]);
  assertEquals(toArray(",", true)("1,2"), [1, 2]);
  assertEquals(toArray(";", true)("1;2"), [1, 2]);
  assertEquals(toArray(",", true)(","), ["", ""]);
  assertEquals(toArray("", true)(""), []);
  assertEquals(toArray(",", true)("hi,1,true"), ["hi", 1, true]);
});

Deno.test("Should map to nested coerced array", () => {
  assertEquals(toArray([",", ":"], true)("1:2,hi:false,99"), [
    [1, 2],
    ["hi", false],
    99,
  ]);
});

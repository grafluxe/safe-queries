# Safe Queries

A dependency free, safe, and smart query string parser.

## How's it Safe

You can create **type safe** params which can be mapped and validated as needed.

## Function Signature

```ts
safeQueries(url: UrlLike, schema?: Schema): Queries
```

### UrlLike

```ts
URL | URLSearchParams | string;
```

The `url` argument accepts a string, [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) or [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams).

### Schema

Simplified for readability (see [types.ts](./src/types.ts) for the full type):

```ts
for-each-query-string…

{

  required?: boolean

  map?: (
    val: string,
    key: string,
    rawParams: Record<string, string | string[]>
  ) => T

  validate?: (
    val: T,
    key: string,
    rawParams: Record<string, string | string[]>
  ) => boolean

}
```

Defining a `Schema` helps harden the queries returned. It optionally takes the types <[Params](#params), [AssumeNoDuplicates](#assumenoduplicates)>

### Queries

Simplified for readability (see [types.ts](./src/types.ts) for the full type):

```ts
{

  raw: string

  param: Record<string, T | T[]>

  foreign?: Record<string, string | string[]>

  duplicate?: string[]

  error?: {
    requiredKeys?: string[]
    invalidKeys?: string[]
    noQueryString?: true
  }

}
```

The returned `Queries` object includes details about expected and unexpected query string data. It optionally takes the types <[Params](#params), [AssumeNoDuplicates](#assumenoduplicates)>

## <Params, AssumeNoDuplicates>

### Params

You can pass a type into either the `Schema` or `safeQueries` function (no need to pass to both) so that TypeScript goodness flows through the logic and is returned in the `params` object.

#### Example

```ts
type Params = { expectedParam: string };

const { param } = safeQueries<Params>(url);
```

-or-

```ts
type Params = { expectedParam: string; };

const schema: Schema<Params> = {…};
const { param } = safeQueries(url, schema);
```

Defining a `Schema` is preferred, as it improves your type safety.

### AssumeNoDuplicates

The query string spec allows for [duplicate query params](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams#duplicate_search_parameters).

`safeQueries` logic supports duplicate query params, but allows you to opt out of this expectation at the type-level. While this does not alter what is returned, setting `AssumeNoDuplicates` to `true` sets the type of your param to `T` and not `T | T[]`.

#### Example

```ts
type Params = { expectedParam: string; };

const schema: Schema<Params> = {…};
const { param } = safeQueries("http://site.com?who=foo&who=bar", schema);

// Type completion of param.who = string | string[]
// The returned value is ["foo", "bar"]
```

-vs-

```ts
type Params = { expectedParam: string; };

const schema: Schema<Params, true> = {…}; // <--- true
const { param } = safeQueries("http://site.com?who=foo&who=bar", schema);

// Type completion of param.who = string
// The returned value is still ["foo", "bar"]
```

Assuming you have logic outside of `safeQueries` to prevent duplicate query params, this feature allows you to skip the array checks (type guards) in your logic.

With `AssumeNoDuplicates` set to `true`:

```ts
param.who.toLowerCase();
```

With it set to `false`:

```ts
param.who.toLowerCase();
// Property 'toLowerCase' does not exist on type 'string | string[]'.
```

## Mappers

This projects ships with the following mapper functions to help coerce your values to defined types. Note that you can easily add your own map functions via the schema.

### toNumber

- Returns a `number` or `NaN`.

### toBoolean

- Returns `true` if the value equals "true" or _undefined_
  - e.g. `http://site.com?debug` will result in `param.debug === true`
- Returns `false` if the value equals "false"
- Returns `null` if the value is anything else
  - You can handle such cases using the `Schema.validate` function

### toArray

- Returns `Array<T = unknown[]>` separated by the delimiter(s) set
  - Nested arrays are supported
  - The default value is ","
- The values can be coerced into `booleans` (if "true" | "false") and `numbers` by setting the `coerce` argument to`true`

#### Example

```ts
const schema: Schema = {
  name: {
    map: toArray(), // same as toArray(",")
  },
};

const url = "http://site.com?name=john,doe";
const { param } = safeQueries(url, schema);

// param: { name: [ "john", "doe" ] }
```

```ts
const schema: Schema = {
  name: {
    map: toArray([";", ","]),
  },
};

const url = "http://site.com?name=john,doe;jane";
const p = safeQueries(url, schema);

// param: { name: [ [ "john", "doe" ], "jane" ] }
```

## Usage

### Basic

```ts
import { safeQueries } from "./mod.ts";

const url = "http://site.com?who=foo&age=99";
const { param } = safeQueries(url);

// param: { who: "foo", age: "99" }
```

### Advanced

```ts
import { Schema, safeQueries, toNumber } from "./mod.ts";

type Params = {
  who: string;
  age?: number;
  other: Date;
};

const schema: Schema<Params, true> = {
  who: {
    required: true,
  },
  age: {
    map: toNumber,
    validate: (num?: number) => (num ? num > 100 : false),
  },
  other: {
    map: (val: string) => new Date(val),
    validate: (date: Date) => date.getMonth() > 9,
  },
};

const url = "http://site.com?who=foo&age=99&bar=not-expected";
const { param, foreign, error } = safeQueries(url, schema);

// param: { who: "foo", age: 99 }
// foreign: { bar: "not-expected" }
// error: { invalidKeys: [ "age" ] }
```

The advanced version uses `Schema<T>`, which allows your editor to provide code completion for your params.

---

See [Additional samples](./samples.ts).

## License

MIT

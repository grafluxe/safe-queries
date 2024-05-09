/** Accepted URL types. */
export type UrlLike = URL | URLSearchParams | string;

/**
 * Defining a `Schema` helps harden the queries returned.
 *
 * Simplified for readability:
 * ```ts
 * for-each-query-string…
 *   {
 *     required?: boolean
 *     map?: (
 *       val: string,
 *       key: string,
 *       rawParams: Record<string, string | string[]>
 *     ) => T
 *     validate?: (
 *       val: T,
 *       key: string,
 *       rawParams: Record<string, string | string[]>
 *     ) => boolean
 *   }
 * ```
 *
 * ### Params
 *
 * You can pass a type into either the `Schema` or `safeQueries` function (no need to pass to both) so that TypeScript goodness flows through the logic and is returned in the `params` object.
 *
 * ### AssumeNoDuplicates
 *
 * The query string spec allows for [duplicate query params](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams#duplicate_search_parameters).
 *
 *`safeQueries` logic supports duplicate query params, but allows you to opt out of this expectation at the type-level. While this does not alter what is returned, setting `AssumeNoDuplicates` to `true` sets the type of your param to `T` and not `T | T[]`.
 *
 * See samples [here](https://github.com/grafluxe/safe-queries/blob/main/samples.ts).
 */
export type Schema<
  Params extends Record<string, unknown> = Record<string, unknown>,
  AssumeNoDuplicates extends boolean = false
> = {
  [K in keyof Params]: {
    required?: boolean;
    map?: (
      val: string,
      key: string,
      rawParams: AssumeNoDuplicates extends true
        ? Record<string, string>
        : Record<string, string | string[]>
    ) => Params[K];
    validate?: (
      val: Params[K],
      key: string,
      rawParams: AssumeNoDuplicates extends true
        ? Record<string, string>
        : Record<string, string | string[]>
    ) => boolean;
  };
};

/** Available errors. */
export type ParamError = {
  requiredKeys?: string[];
  invalidKeys?: string[];
  noQueryString?: true;
};

/**
 * The `Queries` object includes details about expected and unexpected query string data.
 *
 * Simplified for readability:
 * ```ts
 * {
 *   raw: string
 *   param: Record<string, T | T[]>
 *   foreign?: Record<string, string | string[]>
 *   duplicate?: string[]
 *   error?: {
 *     requiredKeys?: string[]
 *     invalidKeys?: string[]
 *     noQueryString?: true
 *   }
 * }
 * ```
 *
 * ### Params
 *
 * You can pass a type into either the `Schema` or `safeQueries` function (no need to pass to both) so that TypeScript goodness flows through the logic and is returned in the `params` object.
 *
 * ### AssumeNoDuplicates
 *
 * The query string spec allows for [duplicate query params](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams#duplicate_search_parameters).
 *
 *`safeQueries` logic supports duplicate query params, but allows you to opt out of this expectation at the type-level. While this does not alter what is returned, setting `AssumeNoDuplicates` to `true` sets the type of your param to `T` and not `T | T[]`.
 *
 * See samples [here](https://github.com/grafluxe/safe-queries/blob/main/samples.ts).
 */
export type Queries<Params, AssumeNoDuplicates> = {
  raw: string;
  param: AssumeNoDuplicates extends true
    ? Params
    : {
        [K in keyof Params]: Params[K] | Params[K][];
      };
  foreign?: AssumeNoDuplicates extends true
    ? Record<string, string>
    : Record<string, string | string[]>;
  duplicate?: string[];
  error?: ParamError;
};

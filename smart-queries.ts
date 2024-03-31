import { ParamError, Queries, Schema, UrlLike } from "./types.ts";
import { convertToSearchParams, getRaw } from "./utils.ts";

export const smartQueries = <
  Params extends Record<string, unknown> = Record<string, unknown>
>(
  url: UrlLike,
  schema?: Schema | Schema<Params>
): Queries<Params> | null => {
  const searchParams =
    url instanceof URLSearchParams ? url : convertToSearchParams(url);
  const param: Record<string, unknown> = {};
  const foreign: Record<string, string> = {};
  const rawParams: Record<string, string> = {};
  const error: ParamError = {};

  let hasForeign = false;
  let hasError = false;

  if (searchParams.size === 0) {
    return null;
  }

  for (const [key, val] of searchParams) {
    rawParams[key] = val;

    if (!schema || !(key in schema)) {
      hasForeign = true;
      foreign[key] = val;
    }
  }

  for (const key in schema) {
    const { require, map, validate } = schema[key];

    if (require && !searchParams.has(key)) {
      hasError = true;
      if (!error.requiredKeys) error.requiredKeys = [];
      error.requiredKeys.push(key);
      continue;
    }

    if (searchParams.has(key)) {
      const val = searchParams.get(key)!;
      const finalVal = map ? map(val as never, key, rawParams) : val;

      if (validate) {
        if (!validate(finalVal as never, key, rawParams)) {
          hasError = true;
          if (!error.invalidKeys) error.invalidKeys = [];
          error.invalidKeys.push(key);
        }
      }

      param[key] = finalVal;
    }
  }

  return Object.assign(
    {
      raw: getRaw(url),
      ...(hasForeign ? { foreign } : {}),
    },
    schema
      ? {
          param,
          ...(hasError ? { error } : {}),
        }
      : {}
  );
};

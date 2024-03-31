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
  const rawParams: Record<string, string | string[]> = {};
  const error: ParamError = {};

  let hasForeign = false;
  let hasError = false;

  if (searchParams.size === 0) {
    return null;
  }

  for (const [key, val] of searchParams) {
    const vals = searchParams.getAll(key);

    if (!schema) {
      param[key] = vals.length === 1 ? vals.at(0) : vals;
    } else {
      rawParams[key] = vals.length === 1 ? vals.at(0)! : vals;

      if (!(key in schema)) {
        hasForeign = true;
        foreign[key] = val;
      }
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
      const vals = searchParams.getAll(key)!;
      const finalVals: unknown[] = map
        ? vals.map((val) => map(val as never, key, rawParams))
        : vals;

      if (validate) {
        finalVals.map((val) => {
          if (!validate(val as never, key, rawParams)) {
            hasError = true;
            if (!error.invalidKeys) error.invalidKeys = [];
            if (!error.invalidKeys.includes(key)) error.invalidKeys.push(key);
          }
        });
      }

      param[key] = finalVals.length === 1 ? finalVals.at(0) : finalVals;
    }
  }

  return Object.assign(
    {
      raw: getRaw(url),
      param,
    },
    schema
      ? {
          param,
          ...(hasForeign ? { foreign } : {}),
          ...(hasError ? { error } : {}),
        }
      : {}
  );
};

import { ParamError, Queries, Schema, UrlLike } from "./types.ts";
import { convertToSearchParams, getRaw } from "./utils.ts";

export const safeQueries = <
  Params extends Record<string, unknown> = Record<string, unknown>,
  AssumeNoDuplicates extends boolean = false
>(
  url: UrlLike,
  schema?: Schema | Schema<Params, AssumeNoDuplicates>
): Queries<Params, AssumeNoDuplicates> => {
  const searchParams =
    url instanceof URLSearchParams ? url : convertToSearchParams(url);
  const param: Record<string, unknown> = {};
  const foreign: Record<string, string | string[]> = {};
  const duplicate: string[] = [];
  const rawParams = {} as AssumeNoDuplicates extends true
    ? Record<string, string>
    : Record<string, string | string[]>;
  const error: ParamError = {};

  let hasForeign = false;
  let hasError = false;

  if (searchParams.size === 0) {
    hasError = true;
    error.noQueryString = true;
  }

  for (const [key] of searchParams) {
    const allVals = searchParams.getAll(key);

    if (allVals.length > 1 && !duplicate.includes(key)) duplicate.push(key);

    const vals = allVals.length === 1 ? allVals.at(0)! : allVals;

    if (!schema) {
      param[key] = vals;
    } else {
      rawParams[key] = vals;

      if (!(key in schema)) {
        hasForeign = true;
        foreign[key] = vals;
      }
    }
  }

  for (const key in schema) {
    const { required, map, validate } = schema[key];

    if (required && !searchParams.has(key)) {
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
      ...(duplicate.length > 0 ? { duplicate } : {}),
      ...(hasError ? { error } : {}),
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

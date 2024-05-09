import { splitter } from "./utils.ts";

/**
 * Use to map a param value to a `number` or `NaN`
 *
 * See samples [here](https://github.com/grafluxe/safe-queries/blob/main/samples.ts).
 */
export const toNumber = (val: string): number =>
  val === "" ? NaN : Number(val);

/**
 * Use to map a param value to a `boolean` or `null`.
 *
 * - Returns `true` if the value equals "true" or _undefined_
 *   - e.g. `http://site.com?debug` will result in `param.debug === true`
 * - Returns `false` if the value equals "false"
 * - Returns `null` if the value is anything else
 *   - You can handle such cases using the `Schema.validate` function
 *
 * See samples [here](https://github.com/grafluxe/safe-queries/blob/main/samples.ts).
 */
export const toBoolean = (val: string): boolean | null =>
  val === "true" || !val ? true : val === "false" ? false : null;

/**
 * Use to map a param value to an array.
 *
 * - Returns `Array<T = unknown[]>` separated by the delimiter(s) set
 *   - Nested arrays are supported
 *   - The default value is ","
 * - The values can be coerced into `booleans` (if "true" | "false") and `numbers` by setting the `coerce` argument to`true`
 *
 * See samples [here](https://github.com/grafluxe/safe-queries/blob/main/samples.ts).
 */
export const toArray =
  <T = unknown[]>(delimiter: string | string[] = ",", coerce = false) =>
  (val: string): T | never[] => {
    if (!val) return [];

    const arr = splitter(
      typeof delimiter === "string" ? [delimiter] : delimiter,
      val,
      coerce
    );

    return (Array.isArray(arr) && arr.length > 1 ? arr : [arr]) as T;
  };

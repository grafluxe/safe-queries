import { Config, UrlLike, ValidType } from "./types.ts";

const getParamsFromString = (url: string) =>
  url.includes("?") ? url.slice(url.indexOf("?")) : "";

export const getRaw = (url: UrlLike) =>
  url instanceof URL
    ? url.search
    : url instanceof URLSearchParams
    ? `?${url.toString().replace(/=$|=(&)/g, "$1")}`
    : getParamsFromString(url);

export const convertToSearchParams = (url: Exclude<UrlLike, URLSearchParams>) =>
  new URLSearchParams(
    url instanceof URL ? url.search : getParamsFromString(url)
  );

export const coerce = (
  val: string,
  // deno-lint-ignore no-explicit-any
  coerceTo: NonNullable<Config<any>["coerceTo"]>
): ValidType | null => {
  switch (coerceTo) {
    case "number":
      return val === "" ? NaN : Number(val);
    case "boolean":
      return val === "true" || !val ? true : val === "false" ? false : null;
    case "string[]":
    case "Array<string>":
      return val.split(",");
    case "number[]":
    case "Array<number>":
      return val.split(",").map(Number);
    default:
      return val;
  }
};

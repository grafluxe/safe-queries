import { UrlLike } from "./types.ts";

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

const coerce = (val: string) => {
  if (val === "true") return true;
  if (val === "false") return false;

  return Number(val) || val;
};

export const splitter = (
  delimiters: string[],
  acc: string | string[],
  shouldCoerce: boolean
): string | number | boolean | (string | number | boolean)[] => {
  const [delim, ...remainingDelims] = delimiters;

  if (typeof acc === "string") {
    return splitter(remainingDelims, acc.split(delim), shouldCoerce);
  }

  if (!Array.isArray(acc)) {
    return acc;
  }

  if (delimiters.length === 0) {
    if (shouldCoerce) {
      return acc.length === 1 ? coerce(acc.at(0)!) : acc.map(coerce);
    } else {
      return acc.length === 1 ? acc.at(0)! : acc;
    }
  }

  return splitter(
    remainingDelims,
    acc.map((val: string) => splitter([delim], val, shouldCoerce)) as never,
    shouldCoerce
  );
};

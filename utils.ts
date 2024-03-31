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

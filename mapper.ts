import { splitter } from "./utils.ts";

export const toNumber = (val: string) => (val === "" ? NaN : Number(val));

export const toBoolean = (val: string) =>
  val === "true" || !val ? true : val === "false" ? false : null;

export const toArray =
  <T = unknown[]>(delimiter: string | string[] = ",", coerce = false) =>
  (val: string) => {
    if (!val) return [];

    const arr = splitter(
      typeof delimiter === "string" ? [delimiter] : delimiter,
      val,
      coerce
    );

    return (Array.isArray(arr) && arr.length > 1 ? arr : [arr]) as T;
  };

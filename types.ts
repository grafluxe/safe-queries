export type UrlLike = URL | URLSearchParams | `http${"" | "s"}://${string}`;

export type ValidType = string | number | boolean | string[] | number[];

type Mapper<T> = (
  val: T,
  key: string,
  rawParams: Record<string, string>
) => unknown;

type Validater<T> = (
  val: T,
  key: string,
  rawParams: Record<string, string>
) => boolean;

export type Config<T> = {
  require?: boolean;
} & (
  | {
      coerceTo?: undefined;
      map?: Mapper<string>;
      validate?: Validater<string>;
    }
  | {
      coerceTo: T extends number
        ? "number"
        : T extends boolean
        ? "boolean"
        : T extends string[]
        ? "string[]" | "Array<string>"
        : T extends number[]
        ? "number[]" | "Array<number>"
        : never;
      map?: Mapper<T>;
      validate?: Validater<T>;
    }
);

export type DefaultParams = Record<string, unknown>;

export type Schema<Params extends Record<string, unknown> = DefaultParams> = {
  [K in keyof Params]: Config<Params[K]>;
};

export type Queries<Params = DefaultParams> = {
  raw: string;
  param: Params;
  foreign?: string[];
  error?: {
    requiredKeys?: string[];
    invalidKeys?: string[];
  };
};

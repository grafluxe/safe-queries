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

export type Config = {
  require?: boolean;
} & (
  | {
      coerceTo?: undefined;
      map?: Mapper<string>;
      validate?: Validater<string>;
    }
  | {
      coerceTo: "number";
      map?: Mapper<number>;
      validate?: Validater<number>;
    }
  | {
      coerceTo: "boolean";
      map?: Mapper<boolean | null>;
      validate?: Validater<boolean | null>;
    }
  | {
      coerceTo: "string[]" | "Array<string>";
      map?: Mapper<string[]>;
      validate?: Validater<string[]>;
    }
  | {
      coerceTo: "number[]" | "Array<number>";
      map?: Mapper<number[]>;
      validate?: Validater<number[]>;
    }
);

export type Schema<Keys extends string = string> = Record<Keys, Config>;

export type DefaultParams = Record<string, unknown>;

export type Queries<Params = DefaultParams> = {
  raw: string;
  param: Params;
  foreign?: string[];
  error?: {
    requiredKeys?: string[];
    invalidKeys?: string[];
  };
};

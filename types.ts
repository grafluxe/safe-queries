export type UrlLike = URL | URLSearchParams | `http${"" | "s"}://${string}`;

export type Schema<
  Params extends Record<string, unknown> = Record<string, unknown>
> = {
  [K in keyof Params]: {
    require?: boolean;
    map?: (
      val: string,
      key: string,
      rawParams: Record<string, string>
    ) => Params[K];
    validate?: (
      val: Params[K],
      key: string,
      rawParams: Record<string, string>
    ) => boolean;
  };
};

export type ParamError = {
  requiredKeys?: string[];
  invalidKeys?: string[];
};

export type Queries<Params> = {
  raw: string;
  param: Params;
  foreign?: string[];
  error?: ParamError;
};

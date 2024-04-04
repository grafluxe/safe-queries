export type UrlLike = URL | URLSearchParams | string;

export type Schema<
  Params extends Record<string, unknown> = Record<string, unknown>,
  AssumeNoDuplicates extends boolean = false
> = {
  [K in keyof Params]: {
    required?: boolean;
    map?: (
      val: string,
      key: string,
      rawParams: AssumeNoDuplicates extends true
        ? Record<string, string>
        : Record<string, string | string[]>
    ) => Params[K];
    validate?: (
      val: Params[K],
      key: string,
      rawParams: AssumeNoDuplicates extends true
        ? Record<string, string>
        : Record<string, string | string[]>
    ) => boolean;
  };
};

export type ParamError = {
  requiredKeys?: string[];
  invalidKeys?: string[];
  noQueryString?: true;
};

export type Queries<Params, AssumeNoDuplicates> = {
  raw: string;
  param: AssumeNoDuplicates extends true
    ? Params
    : {
        [K in keyof Params]: Params[K] | Params[K][];
      };
  foreign?: AssumeNoDuplicates extends true
    ? Record<string, string>
    : Record<string, string | string[]>;
  duplicate?: string[];
  error?: ParamError;
};

import { toArray, toBoolean, toNumber } from "./src/mappers.ts";
import { safeQueries } from "./src/safe-queries.ts";
import { Schema } from "./src/types.ts";

/* --- Nested array --- */

{
  const url = "http://site.com?player=name:John;score:99;active:true";

  type Params = {
    player: [string, string | number | boolean][];
  };

  const schema: Schema<Params, true> = {
    player: {
      map: toArray([";", ":"], true),
    },
  };

  const { param } = safeQueries(url, schema);

  console.log(param.player);
  // [ [ "name", "John" ], [ "score", 99 ], [ "active", true ] ]

  console.log(
    param.player
      .map(([key, val]) => ({ [key]: val }))
      .reduce((acc, cur) => ({ ...acc, ...cur }))
  );
  // { name: "John", score: 99, active: true }
}

/* --- Same as above, but object conversion happens within the mapper --- */

{
  const url = "http://site.com?player=name:John;score:99;active:true";

  type PlayerArray = [string, string | number | boolean][];

  type Params = {
    player: {
      name: string;
      score: number;
      active: boolean;
    };
  };

  const schema: Schema<Params, true> = {
    player: {
      map: (val) => {
        const arr = toArray<PlayerArray>([";", ":"], true)(val);
        const objs = arr.map(([key, val]) => ({ [key]: val }));

        return objs.reduce<Params["player"]>(
          (acc, cur) => ({ ...acc, ...cur }),
          {} as Params["player"]
        );
      },
    },
  };

  const { param } = safeQueries(url, schema);

  console.log(param.player);
  // { name: "John", score: 99, active: true }
}

/* --- Mapped number and boolean  --- */

{
  const data = [
    ["name", "John"],
    ["score", "99"],
    ["active", "true"],
  ];

  type Params = {
    name: string;
    score: number;
    active: boolean | null;
  };

  const schema: Schema<Params> = {
    name: {
      required: true,
    },
    score: {
      map: toNumber,
      validate: (score: number) => score > 0,
    },
    active: {
      map: toBoolean,
    },
  };

  const { error, param } = safeQueries(new URLSearchParams(data), schema);

  if (!error) {
    console.log(param);
    // { name: "John", score: 99, active: true }
  }
}

/* --- Base64 encoded JSON --- */

{
  const url =
    "http://site.com/?player=eyJuYW1lIjoiSm9obiIsInNjb3JlIjo5OSwiYWN0aXZlIjp0cnVlfQ==";

  type Params = {
    player: {
      name: string;
      score: number;
      active: boolean;
    };
  };

  const schema: Schema<Params, true> = {
    player: {
      map: (encodedPlayer: string) => JSON.parse(atob(encodedPlayer)),
      validate: (player: Params["player"]) => player.active,
    },
  };

  const { error, param } = safeQueries(url, schema);

  if (!error) {
    console.log(param.player.name); // John
  }
}

/* --- Duplicate query params --- */

{
  const url =
    "http://site.com/?player=eyJuYW1lIjoiSm9obiIsInNjb3JlIjo5OX0=&player=eyJuYW1lIjoiSmFuZSIsInNjb3JlIjo5OX0=";

  type Params = {
    player: {
      name: string;
      score: number;
    };
  };

  const schema: Schema<Params> = {
    player: {
      map: (encodedPlayer: string) => JSON.parse(atob(encodedPlayer)),
    },
  };

  const { error, param } = safeQueries(url, schema);

  if (!error) {
    if (Array.isArray(param.player)) {
      console.log(param.player.map(({ name }) => name)); // [ "John", "Jane" ]
    } else {
      console.log(param.player.name);
    }
  }
}

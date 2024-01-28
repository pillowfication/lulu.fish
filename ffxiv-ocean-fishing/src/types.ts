export enum Route {
  Indigo,
  Ruby
}

export enum Stop {
  GaladionBay = 237,
  TheSouthernStraitOfMerlthor = 239,
  RhotanoSea = 241,
  TheNorthernStraitOfMerlthor = 243,
  TheCieldalaes = 246,
  TheBloodbrineSea = 248,
  TheRothlytSound = 250,
  TheSirensongSea = 286,
  Kugane = 288,
  TheRubySea = 290,
  TheOneRiver = 292
}

export enum Destination {
  RhotanoSea = Stop.RhotanoSea,
  TheNorthernStraitOfMerlthor = Stop.TheNorthernStraitOfMerlthor,
  TheBloodbrineSea = Stop.TheBloodbrineSea,
  TheRothlytSound = Stop.TheRothlytSound,
  TheRubySea = Stop.TheRubySea,
  TheOneRiver = Stop.TheOneRiver
}

export enum Time {
  Day,
  Sunset,
  Night
}

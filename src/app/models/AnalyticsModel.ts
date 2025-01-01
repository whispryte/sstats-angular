// export interface IAnalyticsModel {
//   gls: IGlickoSeasonInfo,
//   gl5: IHomeAwayValueT<IGlickoRating>,
//   glw: IHomeAwayValue | null,
//   gl5w: IHomeAwayValue | null,
//   mae5: IHomeAwayValue,
//   mae5ind: IHomeAwayValue,
//   mae: IHomeAwayValue,
//
//   gm: IGoalModel,
//   gm5: IGoalModel
// }

export interface IGlickoSeasonInfo {
  rank: Record<number, IGlickoRating>;
  r: IHomeAwayValueT<IGlickoRating>

  hHistory: IGlickoGameHistory[];
  aHistory: IGlickoGameHistory[];

}

export interface IGlickoGameHistory {
  g: number;
  r: number;
}

export interface IGlickoRating {
  r: number;
  d: number;
}

export interface IHomeAwayValue {
  h: number
  a: number
}

export interface IHomeAwayValueT<T> {
  h: T;
  a: T;
}

export interface IGoalModel {
  ha: number;
  hd: number;
  aa: number;
  ad: number;
  xg: IHomeAwayValue;
  w: IHomeAwayValue;
  to: number;
  tu: number;
  btts: number;
  hfa: number;
}

export interface ILastGameStats extends Record<string, any> {
  AvgScore: number,
  AvgConceded: number,
  AvgOddsXg: number,
  AvgOddsXgConceded: number,
  MaeOddsXg: number,
  MaeOddsXgConceded: number,
  RmseXg: number,
  RmseXgConceded: number,
  AvgShots: number,
  AvgOppShots: number,
  AvgCards: number,
  AvgCardsOpp: number,
  AvgCorners: number,
  AvgCornersOpp: number,
  AvgOffsides: number,
  AvgOffsidesOpp: number,
  Profits: ILastGamesProfits;
  GamesCount : number;
  Wins : number;
  Draws : number;
  Loses : number;
  AvgWinOdds : number;
  AvgLoseOdds : number;
  AvgDrawOdds : number;
}

export interface ILastGamesProfits extends Record<string, number> {
  WinProfit: number;
  DrawProfit: number;
  LoseProfit: number;
  WinOrDrawProfit: number;
  WinOrLoseProfit: number;
  LoseOrDrawProfit: number;
  WinNoBet: number;
  LoseNoBet: number;
}

export interface IAnalyticsModel {
  GlickoRatingHome: number;
  GlickoRdHome: number;
  GlickoRatingAway: number;
  GlickoRdAway: number;
  GlickoVolatilityHome: number;
  GlickoVolatilityAway: number;
  HomeWinProbability: number | null;
  AwayWinProbability: number | null;
  DrawProbability: number | null;
  GlickoHomeXg : number | null;
  GlickoAwayXg : number | null;
}

export interface GlickoPrediction {
  FixtureId: number;
  HomeRating: number;
  HomeRd: number;
  AwayRating: number;
  AwayRd: number;
  HomeXg: number | null;
  AwayXg: number | null;
  HomeWinProbability: number | null;
  AwayWinProbability: number | null;
  Updated: string;
  HomeVolatility: number;
  AwayVolatility: number;
}
export interface IFilerBrief {
  period: number;
  fixtureType: "HomeAway" | "All";
  sameLeague: boolean
}

// export interface IAnalyticsValue {
//   Name: string;
//   Title: any;
//   Id: number;
//   Value: number;
// }

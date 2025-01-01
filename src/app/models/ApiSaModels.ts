import {GamesFilterFlags} from "./ApiModels";

export interface IApiSaFixture {
  Id: number;
  LsId: string | null;
  Date: string;
  LeagueId: number;
  SeasonUid: string;
  DateUtc: number,
  Status: number;
  HomeTeam: IApiSaTeam;
  AwayTeam: IApiSaTeam;
  HomeGoals: number | null;
  AwayGoals: number | null;
  ScoreHomeHT: number | null;
  ScoreAwayHT: number | null;
  ScoreHomeFT: number | null;
  ScoreAwayFT: number | null;

  Odds?: IApiSaOdds | null;

  Season?: IApiSaSeason;

  Glicko?: IGlickoProb | null;
}

export interface IApiSaFixtureFull extends IApiSaFixture {
  ScoreHomeET: number | null;
  ScoreAwayET: number | null;
  ScoreHomePT: number | null;
  ScoreAwayPT: number | null;
  RoundName: number | null;
  RefereeName: number | null;

}

export interface IApiSaTeam {
  Id: number;
  Name: string;
  Logo: string;
}

export interface IApiSaCountry {
  Code: string;
  Name: string;
  Flag: string;
  Abbr: string;
  Leagues: IApiSaLeague[];
}

export interface IApiSaLeague {
  Id: number;
  LeagueType: number;
  Logo: string;
  Name: string;
  CountryCode: string;
  Country: IApiSaCountry;
  Enabled: boolean | null;
  IsActive: boolean | null;
  Popularity: number | null;
}

export interface IApiSaSeason {
  Uid: string;
  LeagueId: number;
  Year: number;
  DateStart: string;
  DateEnd: string | null;
  IsCurrent: boolean | null;

  League?: IApiSaLeague;
}

export interface IFixturesByLeagues {
  //country : IApiSaCountry,
  league: IApiSaLeague,
  fixtures: IApiSaFixture[]
}

export interface IFixtureFilter {
  Id?: number[];
  LsId?: string[];
  CountryCode?: string;
  League?: number;
  SeasonYear?: number;
  SeasonId?: string;
  Limit?: number;
  Offset?: number;
  DateStart?: string;
  DateEnd?: string;
  GroupByTournament?: boolean;
  TeamId?: number[];
  TeamsVersus?: boolean;
  Flags?: GamesFilterFlags,
  Status?: FixtureFilterStatus,
  Order?: IFixtureFilterOrder,
  IncludeGlicko?: boolean;
}

export enum IFixtureFilterOrder {
  DateAsc,
  DateDesc,
}

export enum FixtureFilterStatus {
  Ended,
  Live,
  Upcoming
}

export interface IApiSaOdds {
  FixtureId: number;
  BookmakerId?: number;
  Updated?: string;
  Winner_Home?: number;
  Winner_Draw?: number;
  Winner_Away?: number;
  DC_1X?: number;
  DC_12?: number;
  DC_2X?: number;
  DNB_Home?: number;
  DNB_Away?: number;
  OU_Param?: number;
  OU_Over?: number;
  OU_Under?: number;
  OU_Home_Param?: number;
  OU_Home_Over?: number;
  OU_Home_Under?: number;
  OU_Away_Param?: number;
  OU_Away_Over?: number;
  OU_Away_Under?: number;
  XgHome?: number;
  XgAway?: number;
}

export interface IApiSaEvent {
  Id: number,
  Type: number,
  Player: IApiSaPlayer | null,
  TeamId: number
  Minutes: number,
  ExtraMinutes: number | null,
  AssistPlayer: IApiSaPlayer | null,
  Details: string | null
}

export interface IApiSaPlayer {
  Id: number,
  Name: string,
}

export interface IApiSaStatsItem {
  Name: string,
  Home: number | null,
  Away: number | null
}

export interface IApiSaLineupResponse {
  HomeFormation: string | null,
  AwayFormation: string | null,
  HomeCoach: IApiSaPlayer | null,
  AwayCoach: IApiSaPlayer | null,
  Players: IApiSaLineupPlayer[],
  PlayersStats: { PlayerId: number, PlayerName: string, Stats: { Name: string, Value: number }[] }[]
}

export interface IApiSaLineupPlayer extends IApiSaPlayer {
  Photo: string | null,
  Position: string | null,
  IsStartXI: boolean,
  Number: number | null,
  TeamId: number
}

export interface IApiBookmakerOdds {
  BookmakerId: number,
  BookmakerName: string,
  Odds: IApiSaMarket[]
}

export interface IApiSaMarket {
  MarketId: number,
  MarketName: string,
  Odds: { Key: string, Value: number }[]
}

export interface IApiGlickoHistoryResponse {
  home: IApiGlickoHistoryItem[];
  away: IApiGlickoHistoryItem[];
}

export interface IApiGlickoHistoryItem {
  Id: number;
  Date: string;
  Value: number
}

export interface IGlickoProb {
  HomeProb: number;
  AwayProb: number;
  DrawProb: number;
}

export interface IProfitOutcome {
  Name : string;
  GamesCount: number;
  History: number[];
  Value: number;
  Success : number;
}

export interface IProfitMarket{
  market : string;
  outcomes : IProfitOutcome[];
}

export interface IGameProfitResponse {
  home: IProfitMarket[];
  homeFirstHalf: IProfitMarket[];
  homeSecondHalf: IProfitMarket[];
  away: IProfitMarket[];
  awayFirstHalf : IProfitMarket[];
  awaySecondHalf : IProfitMarket[];
}

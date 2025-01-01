import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {firstValueFrom} from "rxjs";
import {
  IApiBookmakerOdds, IApiGlickoHistoryResponse,
  IApiSaEvent,
  IApiSaFixture,
  IApiSaFixtureFull,
  IApiSaLeague,
  IApiSaLineupResponse,
  IApiSaSeason,
  IApiSaStatsItem,
  IFixtureFilter, IGameProfitResponse
} from "../models/ApiSaModels";
import {map} from 'rxjs/operators';
import {GlickoPrediction, IAnalyticsModel, ILastGameStats} from "../models/AnalyticsModel";
import {StorageService} from "./storage.service";

interface ILeaguesContainer {
  map: Map<number, IApiSaLeague>,
  arr: IApiSaLeague[];
  popularity: number[]
}


@Injectable({
  providedIn: 'root',
})
export class DataRepoService {

  public leagues: ILeaguesContainer | null = null;

  //private requestSubj: ReplaySubject<ILeaguesContainer> | null = null;

  constructor(private http: HttpClient, private storage: StorageService) {
  }

  getJson<T>(url: string, paramObj?: { [key: string]: any } | null) {
    if (!paramObj) {
      paramObj = {};
    }
    //paramObj["timeZoneOffset"] = this.storage.timeZone.value;

    let queryParams = objToUrl(paramObj);
    if (url[0] == '/')
      url = url.slice(1);

    if (url.includes('?'))
      url += "&" + queryParams;
    else
      url += "?" + queryParams;

    let tz = this.storage.timeZone.value / 60;
    return firstValueFrom(this.http.get<T>("/" + url, {headers: {'timezone': tz.toString()}}));
  }

  async getLeagues() {
    if (!this.leagues) {
      let leaguesResponse = await firstValueFrom(this.http.get<{ leagues: IApiSaLeague[] }>("/api/leagues"));

      this.leagues = {
        map: new Map(leaguesResponse.leagues.map(j => [j.Id, j])),
        arr: leaguesResponse.leagues,
        popularity: leaguesResponse.leagues.sort((a, b) => a.Popularity! - b.Popularity!).map(i => i.Id)
      };
    }

    return this.leagues;
  }

  async getLeague(id: number) {
    let leagues = await this.getLeagues();
    return leagues.map.get(id) ?? null;
  }


  async getGameStats(gameId: number): Promise<IApiSaStatsItem[] | null> {
    return await firstValueFrom(this.http.get<IApiSaStatsItem[]>('/api/fixtures/' + gameId + "/stats"));
  }

  async getGameEvents(gameId: number) {
    return await firstValueFrom(this.http.get<IApiSaEvent[]>("/api/fixtures/" + gameId + "/events"));
  }

  async getGameLineups(gameId: number) {
    return await firstValueFrom(this.http.get<IApiSaLineupResponse>("/api/fixtures/" + gameId + "/lineups"));
  }

  async getOdds(gameId: number) {
    return await firstValueFrom(this.http.get<IApiBookmakerOdds[]>("/api/fixtures/" + gameId + "/odds"));
  }

  async getGames(filer: IFixtureFilter) {
    let r: {
      fixtures: IApiSaFixture[],
      leagues?: Record<number, IApiSaLeague>,
    } = await this.getJson('/api/fixtures/list', filer);
    return r;
  }

  async getGame(id: number, includeOdds: boolean = false) {
    let r = await this.getJson<IApiSaFixtureFull>("/api/fixtures/" + id, {odds: includeOdds});
    return r;
  }

  async getAnalytics(id: number) {
    let r = await this.getJson<IAnalyticsModel | null>("/api/fixtures/" + id + "/analytics");
    return r;
  }

  async getGlicko(id: number) {
    return await this.getJson<GlickoPrediction>("/api/fixtures/" + id + "/glicko");
  }

  async getLeagueInfo(id: number) {
    let r = await this.getJson<{ league: IApiSaLeague, seasons: IApiSaSeason[] }>("/api/leagues/" + id);
    return r;
  }

  async getGameByLsId(id: string) {
    return await this.getJson<IApiSaFixture>("/api/fixtures/flash-id/" + id);
  }

  async getLastGameStats(id: number, period: number, homeAway = false, sameLeague = true) {
    return await this.getJson<{
      home: ILastGameStats,
      away: ILastGameStats
    }>(`/api/fixtures/${id}/last-games-stats?period=${period}&homeAway=${homeAway}&sameLeague=${sameLeague}`);
  }


  async getGlickoHistory(gameId: number) {
    return await this.getJson<IApiGlickoHistoryResponse>(`/api/fixtures/${gameId}/glicko-history`);
  }

  async getProfits(gameId: number, filter?: any) {
    return await this.getJson<IGameProfitResponse>(`/api/fixtures/${gameId}/profits`, filter);
  }

  async getH2h(gameId: number, filter?: any) {
    return await this.getJson<{
      home: IApiSaFixture[],
      away: IApiSaFixture[],
      h2h: IApiSaFixture[]
    }>(`/api/fixtures/${gameId}/h2h`, filter);
  }
}

function objToUrl(paramObj?: { [key: string]: any } | null): string {
  if (paramObj == null)
    return "";

  let sp = new URLSearchParams();
  for (let key in paramObj) {
    if (paramObj[key] == null)
      continue;
    sp.append(key, paramObj[key].toString());
  }

  return sp.toString();
  //return queryStr ? '?' + queryStr : '';
}

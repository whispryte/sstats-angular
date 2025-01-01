import {Injectable, Signal, signal, WritableSignal} from '@angular/core';
import {IFilerBrief} from "../models/AnalyticsModel";
import {BehaviorSubject, Subject} from "rxjs";
import {GamesFilterFlags} from "../models/ApiModels";

const favouriteGamesLocalStorageKey = "__favourite_games__";
const favouriteTournamentsLocalStorageKey = "__fav_tournaments__";

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  favouriteGames: WritableSignal<Set<number>> = signal(new Set<number>());
  favoriteTournaments: WritableSignal<Set<number>> = signal(new Set<number>());

  timeZone: BehaviorSubject<number> = new BehaviorSubject<number>(-new Date().getTimezoneOffset());

  public compactContent = new BehaviorSubject(false);


  constructor() {
    this.favouriteGames.set(new Set<number>(this.getFromLocalStorage<number[]>(favouriteGamesLocalStorageKey) ?? []));
    this.favoriteTournaments.set(new Set<number>(this.getFromLocalStorage<number[]>(favouriteTournamentsLocalStorageKey) ?? []));

    this.timeZone.subscribe(val => {
      console.debug("Time zone: " + val, typeof val);
    });

    console.debug("fav tournaments", this.favoriteTournaments());
  }

  getFromLocalStorage<T>(key: string) {
    let val = window.localStorage.getItem(key);
    return val ? <T>JSON.parse(val) : null;
  }


  addFavouriteGame(gameId: number) {
    this.favouriteGames.update(set => new Set(set.add(gameId)));
    window.localStorage.setItem(favouriteGamesLocalStorageKey, JSON.stringify([...this.favouriteGames()]));
  }

  removeFavouriteGame(gameId: number) {
    this.favouriteGames.update(set => {
      set.delete(gameId);
      return new Set<number>(set);
    });
    window.localStorage.setItem(favouriteGamesLocalStorageKey, JSON.stringify([...this.favouriteGames()]));
  }

  addFavoriteTournament(tournamentId: number) {
    this.favoriteTournaments.update(set => new Set(set.add(tournamentId)));
    window.localStorage.setItem("__fav_tournaments__", JSON.stringify([...this.favoriteTournaments()]));
  }

  removeFavoriteTournament(tournamentId: number) {
    this.favoriteTournaments.update(set => {
      set.delete(tournamentId);
      return set;
    });
    window.localStorage.setItem("__fav_tournaments__", JSON.stringify([...this.favoriteTournaments()]));
  }

  get briefFilter() {
    let f = window.localStorage.getItem("briefFilter");
    if (!f) return null;
    return JSON.parse(f) as IFilerBrief;
  }

  set briefFilter(filter: IFilerBrief | null) {
    window.localStorage.setItem("briefFilter", JSON.stringify(filter));
  }

  get defaultBookmaker() {
    let b = window.localStorage.getItem("defaultBookmaker");
    return b ? parseInt(b) : null;
  }

  set defaultBookmaker(bookmakerId: number | null) {
    if (bookmakerId)
      window.localStorage.setItem("defaultBookmaker", bookmakerId.toString());
    else
      window.localStorage.removeItem("defaultBookmaker");
  }

  get gamesListSort() {
    return window.localStorage.getItem("gamesListSort") ?? "1";
  }

  set gamesListSort(val: string | null) {
    if (!val) {
      window.localStorage.removeItem("gamesListSort");
    } else {
      window.localStorage.setItem("gamesListSort", val);
    }
  }

  get gamesListDisplayedOdds() {
    const r = window.localStorage.getItem("gamesListOdds");
    return r ? JSON.parse(r) : ["1X2"];
  }

  set gamesListDisplayedOdds(val: string[]) {
    if (!val) {
      window.localStorage.removeItem("gamesListOdds");
    } else {
      window.localStorage.setItem("gamesListOdds", JSON.stringify(val));
    }
  }

  get tournamentFlag() {
    let flag = window.localStorage.getItem("tournamentPageFlag");
    // @ts-ignore
    return flag ? GamesFilterFlags[flag] as GamesFilterFlags : null;
  }

  set tournamentFlag(flag: GamesFilterFlags | null) {
    if (flag != null) {
      window.localStorage.setItem("tournamentPageFlag", GamesFilterFlags[flag]);
    } else {
      window.localStorage.removeItem("tournamentPageFlag");
    }
  }

}

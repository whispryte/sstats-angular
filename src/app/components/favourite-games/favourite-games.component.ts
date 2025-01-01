import {Component, effect, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StorageService} from "../../services/storage.service";
import {IApiSaFixture, IApiSaLeague} from "../../models/ApiSaModels";
import {DataRepoService} from "../../services/data-repo.service";
import {RouterLink} from "@angular/router";

@Component({
    selector: 'app-favourite-games',
    imports: [CommonModule, RouterLink],
    templateUrl: './favourite-games.component.html',
    styleUrl: './favourite-games.component.scss'
})
export class FavouriteGamesComponent {

  games: IApiSaFixture[] = [];
  leagues: Record<number, IApiSaLeague> | null = null;

  constructor(public storage: StorageService, private repo: DataRepoService) {
    effect(async () => {
      await this.loadGames([...storage.favouriteGames()]);
    })
  }

  async loadGames(gameIds: number[]) {
    if (!gameIds.length) {
      this.games = [];
      return;
    }
    let r = await this.repo.getGames({Id: gameIds});
    this.games = r.fixtures;
    this.leagues = r.leagues ?? null;
  }

  leagueName(game: IApiSaFixture) {
    let l = this.leagues?.[game.LeagueId];
    if (!l) return null;
    return l.Country.Name + ": " + l.Name
  }

  removeFromFav(game: IApiSaFixture) {
    this.storage.removeFavouriteGame(game.Id);
  }

}

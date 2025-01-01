import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {IApiSaFixtureFull, IApiSaLeague} from "../../models/ApiSaModels";
import {ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {DataRepoService} from "../../services/data-repo.service";
import {getGameStatusName, getSapiCountryFlag} from "../../helpers";
import {SpinnerComponent} from "../../ui/spinner/spinner.component";
import {GameContextService} from "../../services/game-context.service";
import {StorageService} from "../../services/storage.service";
import {FavStarComponent} from "../../ui/fav-star/fav-star.component";
import {Title} from "@angular/platform-browser";
import {format, parseISO} from "date-fns";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";

@UntilDestroy()
@Component({
    selector: 'app-game-page',
    imports: [CommonModule, RouterLink, SpinnerComponent, RouterOutlet, RouterLinkActive, FavStarComponent],
    templateUrl: './game-page.component.html',
    styleUrl: './game-page.component.scss',
    host: { class: 'd-flex flex-column flex-grow-1' },
    providers: [{ provide: GameContextService }]
})
export class GamePageComponent {
  game : IApiSaFixtureFull | null = null;
  gameId! : number;
  league : IApiSaLeague | null = null;

  loading = false;

  constructor(private route: ActivatedRoute, private repo: DataRepoService, private gameContext : GameContextService, public storage: StorageService, private titleService: Title) {
    this.route.params.pipe(untilDestroyed(this)).subscribe(async p => {

      this.gameId = +p["id"];
      this.game = null;

      this.gameContext.gameId.next(this.gameId);
      this.gameContext.game.next(null);

      this.loading = true;
      await this.loadGame();
      this.loading = false;
    });
  }

  async loadGame(){
    this.game = await this.repo.getGame(this.gameId, true) ?? null;

    this.titleService.setTitle(`${this.game.HomeTeam.Name} - ${this.game.AwayTeam.Name}, ${format(parseISO(this.game.Date),'dd.MM.yyyy')}: API, Glicko2, коэффициенты, статистика, Profit :: Stats.net`);

    this.league = await this.repo.getLeague(this.game.LeagueId);
    this.gameContext.game.next(this.game);
  }

  getStatusLabel(): string {
    if (!this.game)
      return "";
    return getGameStatusName(this.game.Status);
  }

  getCountryIconClass() {
    if (!this.league)
      return null;
    return 'flag-icon flag-icon-' + getSapiCountryFlag(this.league.Country) + ' country-flag me-2';
  }

  toggleFavoriteGame(selected: boolean){
    if(selected)
      this.storage.addFavouriteGame(this.gameId);
    else
      this.storage.removeFavouriteGame(this.gameId);
  }


}

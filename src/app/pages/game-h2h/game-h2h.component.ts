import {AfterViewInit, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IApiSaFixture, IApiSaFixtureFull, FixtureFilterStatus} from "../../models/ApiSaModels";
import {DataRepoService} from "../../services/data-repo.service";
import {GameContextService} from "../../services/game-context.service";
import {GamesListItemComponent} from "../../components/games-list-item/games-list-item.component";
import {GamesListComponent} from "../../components/games-list/games-list.component";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SelectListComponent} from "../../ui/select-list/select-list.component";
import {debounceTime, Subject} from "rxjs";
import {SpinnerComponent} from "../../ui/spinner/spinner.component";
import {Meta, Title} from "@angular/platform-browser";
import {format, parseISO} from "date-fns";

interface IProfitFilter {
  thisLeague: boolean;
  sameGames: boolean;
  homeAway: boolean;
}

@UntilDestroy()
@Component({
    selector: 'app-game-h2h',
    imports: [CommonModule, GamesListComponent, ReactiveFormsModule, FormsModule, SpinnerComponent],
    templateUrl: './game-h2h.component.html',
    styleUrl: './game-h2h.component.scss'
})
export class GameH2hComponent implements AfterViewInit {
  activeTab = 1;

  gameId!: number;
  game: IApiSaFixtureFull | null = null;

  homeGames: IApiSaFixture[] = [];
  awayGames: IApiSaFixture[] = [];
  versus: IApiSaFixture[] = [];

  filter: IProfitFilter = {
    thisLeague: false,
    sameGames: false,
    homeAway: false,
  };

  filterSubject = new Subject<IProfitFilter>();

  loading = false;

  constructor(private repo: DataRepoService, private gameContext: GameContextService, private titleService: Title, private metaService: Meta) {

    gameContext.gameId.pipe(untilDestroyed(this)).subscribe(val => {
      this.gameId = val;
      this.loadData('gameId changed');
    });
    gameContext.game.pipe(untilDestroyed(this)).subscribe(async game => {
      this.game = game;

      if (!game) return;

      let title = `${game.HomeTeam.Name} - ${game.AwayTeam.Name}, ${format(parseISO(game.Date), 'dd.MM.yyyy')}: Предыдущие матчи, похожие матчи, история, H2H :: Stats.net`;

      titleService.setTitle(title);
      metaService.updateTag({
        name: 'description',
        content: "Предыдущие матчи команд, похожие матчи команд"
      });
      metaService.updateTag({
        name: 'keywords',
        content: "похожие матчи,предыдущие матчи,h2h"
      });
    });

    this.filterSubject.pipe(untilDestroyed(this)).pipe(debounceTime(400)).subscribe((searchValue) => {
      this.loadData('filter changed');
    });
  }


  async loadData(source?: string) {
    if (!this.gameId) return;


    this.loading = true;
    let response = await this.repo.getH2h(this.gameId, this.filter);

    this.homeGames = response.home;
    this.awayGames = response.away;
    this.versus = response.h2h;

    this.loading = false;
  }


  filterChanged() {
    this.filterSubject.next(this.filter);
  }

  ngAfterViewInit(): void {
  }

}

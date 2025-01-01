import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IApiSaEvent, IApiSaFixtureFull} from "../../models/ApiSaModels";
import {DataRepoService} from "../../services/data-repo.service";
import {GameContextService} from "../../services/game-context.service";
import {Subject, takeUntil} from "rxjs";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";

@UntilDestroy()
@Component({
    selector: 'app-game-events',
    imports: [CommonModule],
    templateUrl: './game-events.component.html',
    styleUrl: './game-events.component.scss'
})
export class GameEventsComponent {
  gameId!: number;
  events: IApiSaEvent[] | null = null;
  game: IApiSaFixtureFull | null = null;


  constructor(private repo: DataRepoService, private gameContext: GameContextService) {
    gameContext.gameId.pipe(untilDestroyed(this)).subscribe(val => {
      this.gameId = val;
    });
    gameContext.game.pipe(untilDestroyed(this)).subscribe(async val => {
      this.game = val;
      await this.loadData();
    })
  }


  async loadData() {
    this.events = await this.repo.getGameEvents(this.gameId);
  }

}

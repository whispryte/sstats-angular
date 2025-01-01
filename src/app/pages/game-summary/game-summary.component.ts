import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IApiSaEvent, IApiSaFixtureFull} from "../../models/ApiSaModels";
import {DataRepoService} from "../../services/data-repo.service";
import {GameContextService} from "../../services/game-context.service";
import {GameBriefComponent} from "../../components/game-brief/game-brief.component";
import {Title} from "@angular/platform-browser";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";

@UntilDestroy()
@Component({
    selector: 'app-game-summary',
    imports: [CommonModule, GameBriefComponent],
    templateUrl: './game-summary.component.html',
    styleUrl: './game-summary.component.scss'
})
export class GameSummaryComponent implements OnInit {

  gameId!: number;
  game: IApiSaFixtureFull | null = null;


  constructor(private repo: DataRepoService, private gameContext: GameContextService, private titleService: Title) {
    gameContext.gameId.pipe(untilDestroyed(this)).subscribe(val => {
      this.gameId = val;
    });
    gameContext.game.pipe(untilDestroyed(this)).subscribe(async val => {
      this.game = val;
      await this.loadData();
    })
  }


  async loadData() {
  }


  async ngOnInit() {
  }


}

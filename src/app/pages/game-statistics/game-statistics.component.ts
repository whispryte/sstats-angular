import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IApiSaEvent, IApiSaFixtureFull, IApiSaStatsItem} from "../../models/ApiSaModels";
import {DataRepoService} from "../../services/data-repo.service";
import {GameContextService} from "../../services/game-context.service";
import {Subject, takeUntil} from "rxjs";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";

interface IStatsItem {
  label: string,
  homeVal: string,
  awayVal: string,
  percentage: number
}

@UntilDestroy()
@Component({
    selector: 'app-game-statistics',
    imports: [CommonModule],
    templateUrl: './game-statistics.component.html',
    styleUrl: './game-statistics.component.scss'
})
export class GameStatisticsComponent {
  gameId!: number;
  game: IApiSaFixtureFull | null = null;

  stats: IStatsItem[] | null = null;

  xg: { home: string, away: string } | null = null;

  events: IApiSaEvent[] | null = null;


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
    let d = await this.repo.getGameStats(this.gameId!);
    let exclude = ["Calculated Xg", "Expected Goals"];
    if (d) {
      this.stats = d.filter(i => !exclude.includes(i.Name) && ((i.Home ?? 0) >= 0 || (i.Away ?? 0) >= 0)).map(i => <IStatsItem>{
        label: i.Name,
        homeVal: (i.Home ?? 0).toString(),
        awayVal: (i.Away ?? 0).toString(),
        percentage: Math.floor(i.Home! / (i.Home! + i.Away!) * 100)
      });

      let xg = d.find(i => i.Name == "Calculated Xg") ?? d.find(i => i.Name == "Expected Goals");
      if (xg?.Home != null && xg.Away != null) {
        this.xg = {
          home: xg.Home.toFixed(3),
          away: xg.Away.toFixed(3)
        }
      }

      this.events = await this.repo.getGameEvents(this.gameId);
    }
  }

}

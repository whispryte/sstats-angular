import {Component, Input} from '@angular/core';
import {ILastGameStats} from "../../models/AnalyticsModel";
import {CommonModule} from "@angular/common";

@Component({
    selector: 'app-last-game-stats',
    imports: [CommonModule],
    templateUrl: './last-game-stats.component.html',
    styleUrl: './last-game-stats.component.scss'
})
export class LastGameStatsComponent {
  @Input()
  stats!: ILastGameStats;


  statsItemsTitles: Record<string, string> = {
    "AvgScore": "Голов забито",
    "AvgConceded": "Голов пропущено",
    "AvgOddsXg": "Голов забито - прогноз букмекера",
    "AvgOddsXgConceded": "Голов пропущено - прогноз букмекера",
    "MaeOddsXg": "Голов забито - MAE",
    "MaeOddsXgConceded": "Голов пропущено - MAE",
    "RmseXg": "Голов забито - RMSE",
    "RmseXgConceded": "Голов пропущено - RMSE",
    "AvgWinOdds" : "Средний коэффициент на победу",
    "AvgDrawOdds" : "Средний коэффициент на ничью",
    "AvgLoseOdds" : "Средний коэффициент на поражение",
    "AvgShots": "Нанесено ударов",
    "AvgOppShots": "Принято ударов",
    "AvgCards": "Желтые карточки",
    "AvgCardsOpp": "Желтые карточки противника",
    "AvgCorners": "Угловые",
    "AvgCornersOpp": "Угловые противника",
    "AvgOffsides": "Офсайды",
    "AvgOffsidesOpp": "Офсайды противника",
  }

  constructor() {
  }

  get statsItems() {
    return Object.keys(this.statsItemsTitles).map(i => ({title: this.statsItemsTitles[i], value: this.stats[i]}));
  }

  get profitItems() {
    let o = {
      "WinProfit": "Победа",
      DrawProfit: "Ничья",
      LoseProfit: "Поражение",
      WinOrDrawProfit: "Победа или ничья",
      WinOrLoseProfit: "Победа или поражение",
      LoseOrDrawProfit: "Поражение или ничья",
      WinNoBet: "Победа /ничья-возврат",
      LoseNoBet: "Поражение /ничья-возрват"
    };

    return Object.entries(o).map(i => ({title: i[1], value: this.stats.Profits[i[0]]}));
  }


}

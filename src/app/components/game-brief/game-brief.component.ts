import {Component, ComponentRef, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IApiGlickoHistoryResponse, IApiSaEvent, IApiSaFixtureFull} from "../../models/ApiSaModels";
import {DataRepoService} from "../../services/data-repo.service";
import {GameContextService} from "../../services/game-context.service";
import {GlickoPrediction, IAnalyticsModel, IFilerBrief, ILastGameStats} from "../../models/AnalyticsModel";
import {getProbabilities, roundNum} from "../../helpers";
import {OddsNumPipe} from "../../pipes/odds-num.pipe";
import {LastGameStatsComponent} from "../last-game-stats/last-game-stats.component";
import {FormsModule} from "@angular/forms";
import {BehaviorSubject, lastValueFrom, Subject, takeUntil} from "rxjs";
import {ModalComponent} from "../../ui/modal/modal.component";
import {StorageService} from "../../services/storage.service";
import {C3ChartComponent} from "../../ui/c3-chart/c3-chart.component";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";

@UntilDestroy()
@Component({
    selector: 'app-game-brief',
    imports: [CommonModule, OddsNumPipe, LastGameStatsComponent, FormsModule, ModalComponent, C3ChartComponent],
    templateUrl: './game-brief.component.html',
    styleUrl: './game-brief.component.scss'
})
export class GameBriefComponent implements OnInit {
  gameId!: number;
  game: IApiSaFixtureFull | null = null;

  homeMae: number | null = null;
  awayMae: number | null = null;
  mae: number | null = null;

  //analytics: IAnalyticsModel | null = null;
  lastGamesStats: { home: ILastGameStats, away: ILastGameStats } | null = null;
  glicko: GlickoPrediction | null = null;

  probabilities: {
    win: number[] | null,
    dc: number[] | null,
    ou: number[] | null,
    ouh: number[] | null,
    oua: number[] | null
  } | null = null;

  // // Null - All recent games, 1 - Season, 2 - 5 games, 3 - 10 games, 4 - 15 games, 5 - 20 games, 6 - 25 games, 7 - 30 games
  filter: IFilerBrief = {period: 6, fixtureType: "HomeAway", sameLeague: true};
  //
  // filterPeriod = 6;
  // filterFixtureType: "HomeAway" | "All" = "HomeAway";
  // filterSameLeague = true;

  @ViewChild("glickoModal") glickoModal!: ModalComponent;
  @ViewChild("exportModal") exportModal!: ModalComponent;

  plainTextStatistics: string | null = null;

  glickoRatingsHistory: any | null = null;


  constructor(private repo: DataRepoService, private gameContext: GameContextService, private storage: StorageService) {

    let filter = storage.briefFilter;
    if (filter) {
      this.filter = filter;
    }

    gameContext.gameId.pipe(untilDestroyed(this)).subscribe(val => {
      this.gameId = val;
    });

    this.gameContext.game.pipe(untilDestroyed(this)).subscribe(async val => {
      this.game = val;

      if(!this.game) return;

      if (this.game.ScoreHomeFT != null && this.game.Odds?.XgHome) {
        this.homeMae = Math.abs(this.game.ScoreHomeFT - this.game.Odds.XgHome)
      }

      if (this.game.ScoreAwayFT != null && this.game.Odds?.XgAway) {
        this.awayMae = Math.abs(this.game.ScoreAwayFT - this.game.Odds.XgAway)
      }

      if (this.homeMae != null && this.awayMae != null) {
        this.mae = (this.homeMae + this.awayMae) / 2;
      }

      this.calcProbabilities();
      await this.loadData();
    });
  }

  ngOnInit(): void {
  }

  filterChanged() {
    this.storage.briefFilter = this.filter;
    this.loadData();
  }

  async loadData() {
    this.lastGamesStats = await this.repo.getLastGameStats(this.gameId, this.filter.period, this.filter.fixtureType == "HomeAway", this.filter.sameLeague);
    //this.glicko = await this.repo.getAnalytics(this.gameId);
    this.glicko = await this.repo.getGlicko(this.gameId);
  }

  calcProbabilities() {
    if (!this.game?.Odds) return;

    this.probabilities = {
      win: this.game.Odds.Winner_Home ? getProbabilities([this.game.Odds.Winner_Home, this.game.Odds.Winner_Draw!, this.game.Odds.Winner_Away!]) : null,
      dc: this.game.Odds.DC_1X ? getProbabilities([this.game.Odds.DC_1X, this.game.Odds.DC_12!, this.game.Odds.DC_2X!]) : null,
      ou: this.game.Odds.OU_Over ? getProbabilities([this.game.Odds.OU_Under!, this.game.Odds.OU_Over]) : null,
      ouh: this.game.Odds.OU_Home_Over ? getProbabilities([this.game.Odds.OU_Home_Under!, this.game.Odds.OU_Home_Over]) : null,
      oua: this.game.Odds.OU_Away_Over ? getProbabilities([this.game.Odds.OU_Away_Under!, this.game.Odds.OU_Away_Over]) : null
    }
  }

  displayPercentage(val: number | undefined | null) {
    if (!val) return "";
    return Math.round(val * 100) + "%";
  }


  async openGlickoModal(event: MouseEvent) {
    let response = await this.repo.getGlickoHistory(this.gameId);

    this.glickoRatingsHistory = {
      data: {
        xs: {
          [this.game!.HomeTeam.Name]: 'x1',
          [this.game!.AwayTeam.Name]: 'x2',
        },
//        xFormat: '%Y%m%d', // 'xFormat' can be used as custom format of 'x'
        columns: [
          ['x1', ...response.home.map(i => i.Date.split('T')[0])],
          ['x2', ...response.away.map(i => i.Date.split('T')[0])],
          [[this.game!.HomeTeam.Name], ...response.home.map(i => roundNum(i.Value))],
          [[this.game!.AwayTeam.Name], ...response.away.map(i => roundNum(i.Value))]
        ]
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '%d.%m'
          }
        }
      }
    };
    this.glickoModal.title = "Glicko2: Динамика рейтинга команд"
    this.glickoModal.open();
  }

  get glickoDrawProb() {
    if (!this.glicko || !this.glicko.HomeWinProbability || !this.glicko.AwayWinProbability) return null;

    return 1 - this.glicko.HomeWinProbability - this.glicko.AwayWinProbability;
  }

  openExportToText(event: MouseEvent) {
    this.exportModal.open([
      {
        title: "<i class=\"ph ph-clipboard me-1\"></i> Копировать в буффер",
        func: (event) => {
          navigator.clipboard.writeText(this.renderStatisticsToPlainText());
          let btn = event.target as HTMLButtonElement;
          let oldHtml = btn.innerHTML;
          btn.disabled = true;
          btn.innerHTML = "<i class=\"ph ph-check\"></i> Скопировано";
          setTimeout(() => {
            btn.innerHTML = oldHtml;
            btn.disabled = false;
          }, 1500);
        }
      }]);
    this.plainTextStatistics = this.renderStatisticsToPlainText();
  }

  renderStatisticsToPlainText() {
    if (!this.game || !this.game.Odds || !this.lastGamesStats) return "";

    let glickoLines = this.glicko ? `Glicko2: Рейтинг команды ${this.game.HomeTeam.Name}: ${this.glicko.HomeRating.toFixed(2)}
Glicko2: Рейтинг команды ${this.game.AwayTeam.Name}: ${this.glicko.HomeRating.toFixed(2)}
Glicko2: Отклонение команды ${this.game.HomeTeam.Name}: ${this.glicko.HomeRd.toFixed(2)}
Glicko2: Отклонение команды ${this.game.AwayTeam.Name}: ${this.glicko.AwayRd.toFixed(2)}

Прогноз ИИ: Ожидаемое количество голов ${this.game.HomeTeam.Name}: ${this.glicko.HomeXg?.toFixed(2)}
Прогноз ИИ: Ожидаемое количество голов ${this.game.AwayTeam.Name}: ${this.glicko.AwayXg?.toFixed(2)}
Прогноз ИИ: Вероятность победы ${this.game.HomeTeam.Name}: ${(this.glicko.HomeWinProbability! * 100).toFixed(2)}%
Прогноз ИИ: Вероятность ничьи: ${(this.glickoDrawProb! * 100).toFixed(2)}%
Прогноз ИИ: Вероятность победы ${this.game.AwayTeam.Name}: ${(this.glicko.AwayWinProbability! * 100).toFixed(2)}%

` : "";

    return glickoLines + `${this.game.HomeTeam.Name}: Победа ${this.game?.Odds?.Winner_Home?.toFixed(2)}
${this.game.HomeTeam.Name}: Ничья: ${this.game?.Odds?.Winner_Draw?.toFixed(2)}
${this.game.AwayTeam.Name} Победа: ${this.game?.Odds?.Winner_Away?.toFixed(2)}
Общий тотал голов больше ${this.game?.Odds?.OU_Param}: ${this.game?.Odds?.OU_Over?.toFixed(2)}
Общий тотал голов меньше ${this.game?.Odds?.OU_Param}: ${this.game?.Odds?.OU_Under?.toFixed(2)}
Индивидуальный тотал голов ${this.game.HomeTeam.Name} больше ${this.game?.Odds?.OU_Home_Param}: ${this.game?.Odds?.OU_Home_Over?.toFixed(2)}
Индивидуальный тотал голов ${this.game.HomeTeam.Name} меньше ${this.game?.Odds?.OU_Home_Param}: ${this.game?.Odds?.OU_Home_Under?.toFixed(2)}
Индивидуальный тотал голов ${this.game.AwayTeam.Name} больше ${this.game?.Odds?.OU_Away_Param}: ${this.game?.Odds?.OU_Away_Over?.toFixed(2)}
Индивидуальный тотал голов ${this.game.AwayTeam.Name} меньше ${this.game?.Odds?.OU_Away_Param}: ${this.game?.Odds?.OU_Away_Under?.toFixed(2)}
Победа ${this.game.HomeTeam.Name} или возврат: ${this.game?.Odds?.DNB_Home?.toFixed(2)}
Победа ${this.game.AwayTeam.Name} или возрват: ${this.game?.Odds?.DNB_Away?.toFixed(2)}
Победа ${this.game.HomeTeam.Name} или ничья: ${this.game?.Odds?.DC_1X?.toFixed(2)}
Не будет ничьи: ${this.game?.Odds?.DC_12?.toFixed(2)}
Победа ${this.game.AwayTeam.Name} или ничью: ${this.game?.Odds?.DC_2X?.toFixed(2)}

${this.game.HomeTeam.Name}: Ожидаемое количество голов по коэффициентам букмекера: ${this.game.Odds.XgHome?.toFixed(2)}
${this.game.AwayTeam.Name}: Ожидаемое количество голов по коэффициентам букмекера: ${this.game.Odds.XgAway?.toFixed(2)}

${this.game.HomeTeam.Name}: Прибиль при ставках на победу: ${this.lastGamesStats?.home.Profits.WinProfit.toFixed(2)}
${this.game.AwayTeam.Name}: Прибиль при ставках на победу: ${this.lastGamesStats?.away.Profits.WinProfit.toFixed(2)}
${this.game.HomeTeam.Name}: Прибиль при ставках на ничью в матчах: ${this.lastGamesStats?.home.Profits.DrawProfit.toFixed(2)}
${this.game.AwayTeam.Name}: Прибиль при ставках на ничью в матчах: ${this.lastGamesStats?.away.Profits.DrawProfit.toFixed(2)}
${this.game.HomeTeam.Name}: Прибиль при ставках на поражение: ${this.lastGamesStats?.home.Profits.LoseProfit.toFixed(2)}
${this.game.AwayTeam.Name}: Прибиль при ставках на поражение: ${this.lastGamesStats?.away.Profits.LoseProfit.toFixed(2)}
${this.game.HomeTeam.Name}: Прибиль при ставках на победу или возврат: ${this.lastGamesStats?.home.Profits.WinNoBet.toFixed(2)}
${this.game.AwayTeam.Name}: Прибиль при ставках на победу или возврат: ${this.lastGamesStats?.away.Profits.WinNoBet.toFixed(2)}
${this.game.HomeTeam.Name}: Прибиль при ставках на поражение или возврат: ${this.lastGamesStats?.home.Profits.LoseNoBet.toFixed(2)}
${this.game.AwayTeam.Name}: Прибиль при ставках на поражение или возврат: ${this.lastGamesStats?.away.Profits.LoseNoBet.toFixed(2)}
${this.game.HomeTeam.Name}: Прибиль при ставках на победу или ничью: ${this.lastGamesStats?.home.Profits.WinOrDrawProfit.toFixed(2)}
${this.game.AwayTeam.Name}: Прибиль при ставках на победу или ничью: ${this.lastGamesStats?.away.Profits.WinOrDrawProfit.toFixed(2)}
${this.game.HomeTeam.Name}: Прибиль при ставках на поражение или ничью: ${this.lastGamesStats?.home.Profits.LoseOrDrawProfit.toFixed(2)}
${this.game.AwayTeam.Name}: рибиль при ставках на поражение или ничью: ${this.lastGamesStats?.away.Profits.LoseOrDrawProfit.toFixed(2)}
${this.game.HomeTeam.Name}: Прибиль при ставках на победу или поражение: ${this.lastGamesStats?.home.Profits.WinOrLoseProfit.toFixed(2)}
${this.game.AwayTeam.Name}: Прибиль при ставках на победу или поражение: ${this.lastGamesStats?.away.Profits.WinOrLoseProfit.toFixed(2)}

${this.game.HomeTeam.Name}: процент побед: ${(roundNum(this.lastGamesStats.home.Wins / this.lastGamesStats.home.GamesCount * 100))}%
${this.game.HomeTeam.Name}: процент ничьих: ${(roundNum(this.lastGamesStats.home.Draws / this.lastGamesStats.home.GamesCount * 100))}%
${this.game.HomeTeam.Name}: процент поражений: ${(roundNum(this.lastGamesStats.home.Loses / this.lastGamesStats.home.GamesCount * 100))}%
${this.game.AwayTeam.Name}: процент побед: ${(roundNum(this.lastGamesStats.home.Wins / this.lastGamesStats.away.GamesCount * 100))}%
${this.game.AwayTeam.Name}: процент ничьих: ${(roundNum(this.lastGamesStats.home.Draws / this.lastGamesStats.away.GamesCount * 100))}%
${this.game.AwayTeam.Name}: процент поражений: ${(roundNum(this.lastGamesStats.home.Loses / this.lastGamesStats.away.GamesCount * 100))}%
${this.game.HomeTeam.Name}: средний коэффициент на победу: ${roundNum(this.lastGamesStats.home.AvgWinOdds)}
${this.game.HomeTeam.Name}: средний коэффициент на ничью: ${roundNum(this.lastGamesStats.home.AvgDrawOdds)}
${this.game.HomeTeam.Name}: средний коэффициент на поражение: ${roundNum(this.lastGamesStats.home.AvgLoseOdds)}
${this.game.AwayTeam.Name}: средний коэффициент на победу: ${roundNum(this.lastGamesStats.away.AvgWinOdds)}
${this.game.AwayTeam.Name}: средний коэффициент на ничью: ${roundNum(this.lastGamesStats.away.AvgDrawOdds)}
${this.game.AwayTeam.Name}: средний коэффициент на поражение: ${roundNum(this.lastGamesStats.away.AvgLoseOdds)}


${this.game.HomeTeam.Name}: Среднее количество забитых голов за матч: ${this.lastGamesStats.home.AvgScore.toFixed(2)}
${this.game.AwayTeam.Name}: Среднее количество забитых голов за матч: ${this.lastGamesStats.away.AvgScore.toFixed(2)}
${this.game.HomeTeam.Name}: Среднее количество пропущенных голов за матч: ${this.lastGamesStats.home.AvgConceded.toFixed(2)}
${this.game.AwayTeam.Name}: Среднее количество пропущенных голов за матч: ${this.lastGamesStats.away.AvgConceded.toFixed(2)}
${this.game.HomeTeam.Name}: Среднее количество пропущенных голов за матч по прогнозам букмекера: ${this.lastGamesStats.home.AvgOddsXg.toFixed(2)}
${this.game.AwayTeam.Name}: Среднее количество пропущенных голов за матч по прогнозам букмекера: ${this.lastGamesStats.away.AvgOddsXg.toFixed(2)}
${this.game.HomeTeam.Name}: Среднее отклонение (MAE) в прогнозировании букмекером забитых голов: ${this.lastGamesStats.home.MaeOddsXg.toFixed(2)}
${this.game.AwayTeam.Name}: Среднее отклонение (MAE) в прогнозировании букмекером забитых голов: ${this.lastGamesStats.away.MaeOddsXg.toFixed(2)}
${this.game.HomeTeam.Name}: Среднее отклонение (MAE) в прогнозировании букмекером пропущенных голов: ${this.lastGamesStats.home.MaeOddsXgConceded.toFixed(2)}
${this.game.AwayTeam.Name}: Среднее отклонение (MAE) в прогнозировании букмекером пропущенных голов: ${this.lastGamesStats.away.MaeOddsXgConceded.toFixed(2)}
`;
  }
}

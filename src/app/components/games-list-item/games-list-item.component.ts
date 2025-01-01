import {AfterViewInit, booleanAttribute, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IApiSaFixture, IApiSaFixtureFull} from "../../models/ApiSaModels";
import {Router, RouterLink} from "@angular/router";
import {gameIsFinished, getGameWinner, getProbabilities} from "../../helpers";
import {StorageService} from "../../services/storage.service";

@Component({
    selector: 'app-games-list-item',
    imports: [CommonModule, RouterLink],
    templateUrl: './games-list-item.component.html',
    styleUrl: './games-list-item.component.scss'
})
export class GamesListItemComponent implements OnChanges {
  @Input({required: true})
  game!: IApiSaFixture;

  @Input({transform: booleanAttribute})
  compact: boolean = false;

  @Input()
  winForTeam?: number;

  winnerLabel: string | null = null;
  winnerTeamId: number | null = null;

  profitGlicko: boolean[] = [false,false,true];

  constructor(private storage: StorageService, private router: Router) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.winnerLabel = this.getWinnerLabel();
    this.winnerTeamId = getGameWinner(this.game);

    if (this.game.Glicko && this.game.Odds && this.game.Odds.Winner_Home && this.game.Odds.Winner_Draw && this.game.Odds.Winner_Away) {
      let probs = [1/this.game.Odds.Winner_Home, 1/this.game.Odds.Winner_Draw, 1/this.game.Odds.Winner_Away];
      this.profitGlicko = [this.game.Glicko.HomeProb, this.game.Glicko.DrawProb, this.game.Glicko.AwayProb]
        .map(((i, ix) => i > probs[ix]));
    }
  }

  getMae(): number | null {
    if (!this.game.Odds?.XgHome || this.game.ScoreHomeFT == null || !gameIsFinished(this.game.Status) || !this.game.Odds.XgAway || this.game.ScoreAwayFT == null) {
      return null;
    }

    return (Math.abs(this.game.Odds.XgHome - this.game.ScoreHomeFT) + Math.abs(this.game.Odds.XgAway - this.game.ScoreAwayFT)) / 2;
  }

  toggleFavouriteGame(event: MouseEvent, game: IApiSaFixture) {
    event.stopPropagation();

    if (this.storage.favouriteGames().has(game.Id)) {
      this.storage.removeFavouriteGame(game.Id);
    } else {
      this.storage.addFavouriteGame(game.Id);
    }
  }

  isFavourite() {
    return this.storage.favouriteGames().has(this.game.Id);
  }

  getWinnerLabel() {
    if (!this.winForTeam || this.winForTeam != this.game.HomeTeam.Id && this.winForTeam != this.game.AwayTeam.Id) return null;
    let winner = getGameWinner(this.game);
    if (winner == null)
      return null;
    if (winner == 0)
      return "D";
    if (this.winForTeam == winner)
      return "W";
    return "L";
  }

  winnerLabelClass() {
    if (this.winnerLabel == "W")
      return "bg-success"
    else if (this.winnerLabel == "L")
      return "bg-danger";
    return "bg-dark bg-opacity-75";
  }

  openGame(game :  IApiSaFixture){
    window.open('/g/'+game.Id);
  }

}

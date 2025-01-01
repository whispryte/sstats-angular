import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DataRepoService} from "../../services/data-repo.service";
import {GameContextService} from "../../services/game-context.service";
import {IApiBookmakerOdds, IApiSaFixtureFull} from "../../models/ApiSaModels";
import {StorageService} from "../../services/storage.service";
import {FormsModule} from "@angular/forms";
import {Subject, takeUntil} from "rxjs";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";

@UntilDestroy()
@Component({
    selector: 'app-game-odds',
    imports: [CommonModule, FormsModule],
    templateUrl: './game-odds.component.html',
    styleUrl: './game-odds.component.scss'
})
export class GameOddsComponent {

  gameId!: number;
  game: IApiSaFixtureFull | null = null;

  odds: IApiBookmakerOdds[] | null = null;

  selectedBookmaker: number = 0;


  constructor(private repo: DataRepoService, private gameContext: GameContextService, private storage: StorageService) {
    gameContext.gameId.pipe(untilDestroyed(this)).subscribe(val => {
      this.gameId = val;
    });
    gameContext.game.pipe(untilDestroyed(this)).subscribe(async val => {
      this.game = val;
      await this.loadData();
    });
  }

  async loadData() {
    this.odds = await this.repo.getOdds(this.gameId!);

    if(!this.odds || this.odds.length === 0) return;

    let defaultBookie = this.storage.defaultBookmaker;

    let ix = defaultBookie ? this.odds.findIndex(i => i.BookmakerId == defaultBookie) : -1;
    if (ix > -1) {
      this.selectedBookmaker = ix!;
    }else{
      this.selectedBookmaker = 0;
    }
  }

  selectBook(event: any) {
    //  [(ngModel)]="selectedBookmaker" name="book" (ngModelChange)="bookChanged()"
    this.selectedBookmaker = +event.target.value;

    this.storage.defaultBookmaker = this.odds![this.selectedBookmaker].BookmakerId;
  }

  calcColsNum(oddsLength: number) {
    if (oddsLength >= 5)
      return 3;
    return 12 / oddsLength;
  }



}

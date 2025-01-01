import { Component } from '@angular/core';
import {IApiSaFixture} from "../../models/ApiSaModels";
import {NgIf} from "@angular/common";
import {GamesListItemComponent} from "../../components/games-list-item/games-list-item.component";
import {DataRepoService} from "../../services/data-repo.service";
import {FormsModule} from "@angular/forms";

@Component({
    selector: 'app-flash-id-convert',
    imports: [
        NgIf,
        GamesListItemComponent,
        FormsModule
    ],
    templateUrl: './flash-id-convert.component.html',
    styleUrl: './flash-id-convert.component.scss'
})
export class FlashIdConvertComponent {
  game : IApiSaFixture | null = null;

  gameId : string = "";

  notFound = false;

  constructor(private repo : DataRepoService) {
  }

  async find(){
    console.debug("game id ", this.gameId);
    if(!this.gameId){
      this.game = null;
      this.notFound = false;
      return;
    }
    let result = await this.repo.getGameByLsId(this.gameId);
    this.game = result ?? null;

    if(!this.game){
      this.notFound = true;
    }else{
      this.notFound = false;
    }
  }
}

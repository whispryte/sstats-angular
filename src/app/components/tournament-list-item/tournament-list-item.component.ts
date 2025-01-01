import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IApiSaCountry, IApiSaLeague} from "../../models/ApiSaModels";
import {getSapiCountryFlag} from "../../helpers";
import {RouterLink} from "@angular/router";
import {StorageService} from "../../services/storage.service";
import {FavStarComponent} from "../../ui/fav-star/fav-star.component";

@Component({
  selector: '[app-tournament-list-item]',
  imports: [CommonModule, RouterLink, FavStarComponent],
  templateUrl: './tournament-list-item.component.html',
  styleUrl: './tournament-list-item.component.scss'
})
export class TournamentListItemComponent {
  @Input()
  country!: { country: IApiSaCountry, leagues: IApiSaLeague[] };

  open = false;

  constructor(private storage: StorageService) {
  }

  getCountryIconClass() {
    return 'flag-icon flag-icon-' + getSapiCountryFlag(this.country.country) + ' country-flag';
  }

  toggleFavorite(league: IApiSaLeague) {

    // event.stopPropagation();
    // event.preventDefault();

    if (this.isFavorite(league)) {
      this.storage.removeFavoriteTournament(league.Id);
    } else {
      this.storage.addFavoriteTournament(league.Id);
    }
    console.debug("favs", this.storage.favoriteTournaments());
  }

  isFavorite(league: IApiSaLeague) {
    return this.storage.favoriteTournaments().has(league.Id);
  }
}

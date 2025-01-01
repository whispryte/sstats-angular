import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DataRepoService} from "../../services/data-repo.service";
import {IApiSaCountry, IApiSaLeague} from "../../models/ApiSaModels";
import {groupBy} from 'lodash';
import {getSapiCountryFlag} from "../../helpers";
import {TournamentListItemComponent} from "../tournament-list-item/tournament-list-item.component";
import {FormsModule} from "@angular/forms";
import {debounceTime, distinctUntilChanged, Subject, takeUntil} from "rxjs";
import {RouterLink} from "@angular/router";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {StorageService} from "../../services/storage.service";
import {FavStarComponent} from "../../ui/fav-star/fav-star.component";

export interface ICountryLeagues {
  country: IApiSaCountry;
  leagues: IApiSaLeague[]
}

@UntilDestroy()
@Component({
  selector: 'app-tournament-list',
  imports: [CommonModule, TournamentListItemComponent, FormsModule, RouterLink, FavStarComponent],
  templateUrl: './tournament-list.component.html',
  styleUrl: './tournament-list.component.scss'
})
export class TournamentListComponent implements OnInit {

  list: IApiSaLeague[] | null = null;
  grouped: ICountryLeagues[] = [];
  filtered: ICountryLeagues[] = [];

  countrySearch: Subject<string> = new Subject<string>();

  pupular: IApiSaLeague[] = [];

  //favoriteTournaments: IApiSaLeague[] = [];

  get favoriteTournaments() {
    if (!this.repo.leagues) {
      return [];
    }
    return [...this.storage.favoriteTournaments()].map(i => this.repo.leagues!.map.get(i)!);
  }

  isFavorite(league: IApiSaLeague) {
    return this.storage.favoriteTournaments().has(league.Id);
  }

  constructor(private repo: DataRepoService, private storage: StorageService) {
    this.countrySearch.pipe(untilDestroyed(this)).pipe(debounceTime(200), distinctUntilChanged()).subscribe(val => {
      let loweCaseVal = val.toLowerCase();
      this.filtered = val ? this.grouped.filter(i => i.country.Name.toLowerCase().includes(loweCaseVal)) : this.grouped;
    });
  }


  async ngOnInit(): Promise<void> {
    this.list = (await this.repo.getLeagues()).arr.sort((a, b) => (b.Popularity ?? 0) - (a.Popularity ?? 0));
    let grouped = Object.entries(groupBy(this.list, i => i.Country.Name)).map(i => ({
      country: i[1][0].Country,
      leagues: i[1]
    }));
    this.grouped = grouped.sort((a, b) => a.country.Name.localeCompare(b.country.Name));
    this.filtered = grouped;

    const popular = [2, 39, 3, 135, 140, 235, 78, 61];

    this.pupular = this.list.filter(i => popular.includes(i.Id));

    //this.favoriteTournaments = (await Promise.all([...this.storage.favoriteTournaments()].map(async i => await this.repo.getLeague(i)))).filter(i => i != null);
  }

  searchChanged(el: Event) {
    //console.debug("changed", (el.target as HTMLInputElement));
    this.countrySearch.next((el.target as HTMLInputElement).value);
  }

  getCountryIconClass(country: IApiSaCountry) {
    return 'flag-icon flag-icon-' + getSapiCountryFlag(country) + ' country-flag';
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

}

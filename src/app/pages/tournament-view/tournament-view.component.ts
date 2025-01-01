import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterLink} from "@angular/router";
import {IApiSaFixture, IApiSaLeague, IApiSaSeason} from "../../models/ApiSaModels";
import {DataRepoService} from "../../services/data-repo.service";
import {GamesListComponent} from "../../components/games-list/games-list.component";
import {SpinnerComponent} from "../../ui/spinner/spinner.component";
import {IDateRange, WeekPickerComponent} from "../../ui/week-picker/week-picker.component";
import {getYear, startOfDay} from "date-fns";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {GamesFilterFlags} from "../../models/ApiModels";
import {getSapiCountryFlag} from "../../helpers";
import {ISelectListItem, SelectListComponent} from "../../ui/select-list/select-list.component";
import {StorageService} from "../../services/storage.service";
import {Meta, Title} from "@angular/platform-browser";

interface ILeagueFixtures {
  league: IApiSaLeague;
  fixtures: IApiSaFixture[]
}

@UntilDestroy()
@Component({
    selector: 'app-tournament-view',
    imports: [CommonModule, GamesListComponent, SpinnerComponent, RouterLink, WeekPickerComponent, SelectListComponent],
    templateUrl: './tournament-view.component.html',
    styleUrl: './tournament-view.component.scss',
    host: { class: 'd-flex flex-column flex-grow-1' }
})
export class TournamentViewComponent implements OnInit, AfterViewInit {

  tournamentId!: number;
  seasonYear: number | null = null;
  league: IApiSaLeague | null = null;

  fixtures: IApiSaFixture[] = [];

  loading = false;
  loadingMore = false;

  dateRange: IDateRange = {startDate: startOfDay(new Date())};

  seasons: IApiSaSeason[] = [];

  @ViewChild('bottomEl')
  bottomEl?: ElementRef;

  filterSelectItems: ISelectListItem[] = [
    {value: GamesFilterFlags.Recent, text: "Недавние"},
    {value: GamesFilterFlags.Ended, text: "Завершенные"},
    {value: GamesFilterFlags.Upcoming, text: "Предстоящие"},
    {value: GamesFilterFlags.All, text: "Все"},
  ];

  get flag() {
    return this.storage.tournamentFlag ?? GamesFilterFlags.Recent;
  }

  set flag(val) {
    this.storage.tournamentFlag = val;
  }

  get currentSeasonTitle() {
    let s = this.seasons.find(i => i.Year == this.seasonYear);
    if (!s) return null;
    if (!s.DateEnd) return s.Year;
    let start = getYear(new Date(s.DateStart));
    let end = getYear(new Date(s.DateEnd));
    return start == end ? start : start + "/" + end;
  }


  constructor(private route: ActivatedRoute, private repo: DataRepoService, public storage: StorageService,
              private cdr: ChangeDetectorRef, private titleService: Title, private metaService: Meta) {
    this.route.params.pipe(untilDestroyed(this)).subscribe(async p => {
      let tournamentId: number = p["id"];
      this.tournamentId = tournamentId;
      this.seasonYear = p["season"];
      this.league = await repo.getLeague(+tournamentId) ?? null;

      this.updatePageTitle();


      this.loading = true;
      await this.loadSeasons();
      await this.loadGames();
      this.loading = false;
    });
  }

  updatePageTitle() {
    if (this.league) {
      let title = this.league.Country.Name + ": " + this.league.Name;
      if (this.seasonYear) {
        title += " " + this.currentSeasonTitle;
      }
      title += " :: API, Glicko2, Статистика, Profit :: Sstats.net";

      this.titleService.setTitle(title);

      this.metaService.updateTag({name: 'description', content: "База данных, выгрузка, API"});
      this.metaService.updateTag({
        name: 'keywords',
        content: [this.league.Country.Name, this.league.Name, "api,xg,glicko,profit,json,csv"].join(",")
      });
    }
  }


  async loadGames() {
    this.loading = true;
    let response = await this.repo.getGames({
      // League: this.tournamentId,
      SeasonId: this.seasons.find(i => i.Year == this.seasonYear)?.Uid,
      Flags: this.flag,
      IncludeGlicko: true
    });
    this.fixtures = response.fixtures;
    this.loading = false;
  }

  async ngOnInit() {
    //await this.loadGames();
  }

  dateChanged(event: any) {

  }

  async loadSeasons() {
    let r = await this.repo.getLeagueInfo(this.tournamentId);
    this.seasons = r.seasons.sort((a, b) => (b.Year - a.Year));
    if (!this.seasonYear) {
      this.seasonYear = this.seasons[0].Year;
    }
    this.updatePageTitle();
  }

  ngAfterViewInit(): void {
    let el = this.bottomEl?.nativeElement as HTMLDivElement;
    let observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (!this.loading || this.fixtures.length) {
          this.loadMore();
        }
      }
    }, {
      root: null
    });

    observer.observe(el);

    this.storage.compactContent.pipe(untilDestroyed(this)).subscribe(content => {
      this.cdr.detectChanges();
    })
  }

  async loadMore() {
    this.loadingMore = true;
    let response = await this.repo.getGames({
      // League: this.tournamentId,
      SeasonId: this.seasons.find(i => i.Year == this.seasonYear)?.Uid,
      Offset: this.fixtures.length,
      Flags: this.flag,
      IncludeGlicko: true
    });
    this.fixtures.push(...response.fixtures);
    this.loadingMore = false;
  }


  protected readonly getSapiCountryFlag = getSapiCountryFlag;
}

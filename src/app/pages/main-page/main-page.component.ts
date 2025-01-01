import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GamesListComponent} from "../../components/games-list/games-list.component";
import {IApiSaFixture, IApiSaLeague, IFixtureFilterOrder, FixtureFilterStatus} from "../../models/ApiSaModels";
import {DataRepoService} from "../../services/data-repo.service";
import {IDateRange, SerializeRange, WeekPickerComponent} from "../../ui/week-picker/week-picker.component";
import {addDays, startOfDay} from "date-fns";
import {groupBy} from "lodash";
import {SpinnerComponent} from "../../ui/spinner/spinner.component";
import {ActivatedRoute, NavigationStart, Router} from "@angular/router";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {debounceTime} from "rxjs";
import {StorageService} from "../../services/storage.service";
import {ISelectListItem, SelectListComponent} from "../../ui/select-list/select-list.component";
import {FormsModule} from "@angular/forms";

interface ILeagueGames {
  league: IApiSaLeague;
  games: IApiSaFixture[]
}

interface IGamesDateGroup {
  date: string,
  leagues: IGamesLeagueGroup[]
}

interface IGamesLeagueGroup {
  league: IApiSaLeague,
  games: IApiSaFixture[]
}

@UntilDestroy()
@Component({
  selector: 'app-main-page',
  imports: [CommonModule, GamesListComponent, WeekPickerComponent, SpinnerComponent, SelectListComponent, FormsModule],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss',
  host: {class: 'd-flex flex-column flex-grow-1'}
})
export class MainPageComponent implements OnInit, AfterViewInit, OnDestroy {
  allLeagues: Record<number, IApiSaLeague> = [];

  loading = false;
  loadingMore: boolean = false;
  fetchedAll = false;

  @ViewChild('bottomEl')
  bottomEl?: ElementRef;

  dateRange: IDateRange = {startDate: startOfDay(new Date())};

  groupedByDateGames: IGamesDateGroup[] = [];


  static gamesStorage: IGamesDateGroup[] | null = null;
  //static gamesStorageUrl: string | null = null;
  //static scrollPosition: any;
  static todayFilter? : string;

  filterItems: ISelectListItem[] = [
    {text: "Все", value: "all"},
    {text: "Прошедшие", value: "past"},
    {text: "Предстоящие", value: "next"},
    {text: "Live", value: "live"},
  ];

  //todayFilter = "all";

  get todayFilter(){
    return this.isToday ? MainPageComponent.todayFilter : undefined;
  }

  set todayFilter(val : string | undefined){
    MainPageComponent.todayFilter = val;
  }

  get isToday() {
    let today = +startOfDay(new Date());
    return +this.dateRange.startDate == today
      && (!this.dateRange.endDate || +this.dateRange.endDate == today);
  }

  get totalGamesCount() {
    return this.groupedByDateGames.reduce((prev, cur) =>
      prev + cur.leagues.reduce((p, c) => p + c.games.length, 0), 0);
  }

  get contentWrapperEl() {
    return document.getElementsByClassName('content-inner')[0] as HTMLDivElement;
  }

  get todayStatus(){
    let status : FixtureFilterStatus | undefined = undefined;
    if(this.isToday){
      if(MainPageComponent.todayFilter == "past")
        status = FixtureFilterStatus.Ended;
      else if(MainPageComponent.todayFilter == "next")
        status = FixtureFilterStatus.Upcoming;
      else if(MainPageComponent.todayFilter == "live")
        status = FixtureFilterStatus.Live
    }
    return status;
  }

  constructor(private repo: DataRepoService, private route: ActivatedRoute, private router: Router, private cdr: ChangeDetectorRef, public storage: StorageService) {
    route.queryParams.pipe(untilDestroyed(this)).subscribe(queryParams => {
      let range = queryParams["date"];
      console.debug("date query changed", range);
      MainPageComponent.todayFilter = undefined;
      if (!range) {
        this.dateRange = {startDate: startOfDay(new Date())};
      } else {

        let dateRange = parseDateRange(range);
        if (dateRange) {
          if((dateRange.startDate.getTime() != this.dateRange.startDate.getTime() || dateRange.endDate && dateRange.endDate.getTime() != this.dateRange.endDate?.getTime())){
            this.dateRange = dateRange;
          }
        } else
          this.dateRange = {startDate: startOfDay(new Date())};

      }
      this.loadGames();
    });

    router.events.pipe(untilDestroyed(this)).subscribe(event => {
      if (event instanceof NavigationStart && event.url.startsWith("/g/")) {
        MainPageComponent.gamesStorage = this.groupedByDateGames;
        //MainPageComponent.gamesStorageUrl = window.location.href;
        //MainPageComponent.scrollPosition = this.contentWrapperEl.scrollTop;
      }
    })
  }

  async ngOnInit() {
    this.storage.compactContent.pipe(untilDestroyed(this), debounceTime(300)).subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  async loadGames() {
    // if (MainPageComponent.gamesStorageUrl && MainPageComponent.gamesStorage && MainPageComponent.gamesStorageUrl == window.location.href) {
    //   this.groupedByDateGames = MainPageComponent.gamesStorage;
    //   setTimeout(() => {
    //     let el = this.contentWrapperEl;
    //     el.style.scrollBehavior = "auto";
    //     el.scrollTop = MainPageComponent.scrollPosition;
    //     el.style.scrollBehavior = "smooth";
    //   }, 0);
    //   return;
    // }

    console.debug("Loading games");

    this.loading = true;
    this.fetchedAll = false;
    let range = this.dateRange;

    let response = await this.repo.getGames({
      DateStart: range.startDate.toISOString(),
      DateEnd: range.endDate?.toISOString() ?? addDays(range.startDate, 1).toISOString(),
      Order: IFixtureFilterOrder.DateAsc,
      IncludeGlicko: true,
      Status: this.todayStatus,
    });
    this.allLeagues = response.leagues!;

    this.groupedByDateGames = this.makeGames(response.fixtures);


    this.loading = false;
    console.debug("Loading games done", response.fixtures.length);
  }

  async loadMore() {
    if (this.fetchedAll || this.loading) return;

    console.debug("loadMore", this.totalGamesCount);

    this.loadingMore = true;
    let range = this.dateRange;

    try {
      let response = await this.repo.getGames({
        DateStart: range.startDate.toISOString(),
        DateEnd: range.endDate?.toISOString() ?? addDays(range.startDate, 1).toISOString(),
        Offset: this.totalGamesCount,
        Order: IFixtureFilterOrder.DateAsc,
        IncludeGlicko: true,
        Status: this.todayStatus,
      });
      for (let l in response.leagues!) {
        if (!this.allLeagues[+l])
          this.allLeagues[+l] = response.leagues[l];
      }

      let grouped = this.makeGames(response.fixtures);
      this.groupedByDateGames.push(...grouped);

      if (response.fixtures.length < 100) {
        this.fetchedAll = true;
      }

    } finally {
      this.loadingMore = false;
    }

    MainPageComponent.gamesStorage = this.groupedByDateGames;
  }

  dateChanged(dateRange: IDateRange) {
    if (!dateRange.startDate) return;
    this.dateRange = dateRange;
    this.router.navigate(['/'], {queryParams: {"date": SerializeRange(dateRange)}})
  }

  ngAfterViewInit(): void {
    let el = this.bottomEl?.nativeElement as HTMLDivElement;
    let observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (!this.loading || this.totalGamesCount) {
          this.loadMore();
        }
      }
    }, {
      root: null
    });

    observer.observe(el);


  }

  ngOnDestroy(): void {
  }

  makeGames(games: IApiSaFixture[]) {
    let grouped = groupBy(games, i => roundDateTo5(i.Date));

    return Object.entries(grouped).map(i => ({
      date: i[0],
      leagues: Object.entries(groupBy(i[1], j => j.LeagueId)).map(j => ({league: this.allLeagues[+j[0]], games: j[1]})),
    })) as IGamesDateGroup[];
  }

  filterChanged(val : string){
    this.loadGames();
  }
}


function parseDateRange(dateStr?: string | null): IDateRange | null {
  if (!dateStr) return null;
  const [start, end] = dateStr.split('--');
  return {startDate: new Date(start + " 00:00"), endDate: end ? new Date(end + " 00:00") : undefined};
}

function roundDateTo5(date: string) {
  let time = new Date(date).getTime();
  let minutes = Math.trunc(time / 1000 / 60);
  let m = minutes % 5;
  if (m > m / 2)
    return new Date((minutes - m + 5) * 1000 * 60);
  return new Date((minutes - m) * 1000 * 60);
}

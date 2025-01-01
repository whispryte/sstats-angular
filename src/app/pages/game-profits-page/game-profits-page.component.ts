import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DataRepoService} from "../../services/data-repo.service";
import {GameContextService} from "../../services/game-context.service";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {IGameProfitResponse, IProfitMarket, IProfitOutcome} from "../../models/ApiSaModels";
import {DecimalPipe, KeyValuePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {SpinnerComponent} from "../../ui/spinner/spinner.component";
import {TooltipDirective} from "../../directives/tooltip.directive";
import {PopoverDirective} from "../../directives/popover.directive";
import {ScriptLoaderService} from "../../services/script-loader.service";
import {ModalComponent} from "../../ui/modal/modal.component";
import {C3ChartComponent} from "../../ui/c3-chart/c3-chart.component";
import {ISelectListItem, SelectListComponent} from "../../ui/select-list/select-list.component";
import {FormsModule} from "@angular/forms";
import {debounceTime, Subject} from "rxjs";
import {Meta, Title} from "@angular/platform-browser";
import {format, parseISO} from "date-fns";

interface IProfitFilter {
  thisLeague: boolean;
  sameGames: boolean;
  homeAWay: boolean;
  bookieId?: string;
  limit: number;
}

@UntilDestroy()
@Component({
    selector: 'app-game-profits-page',
    imports: [
        NgIf,
        NgForOf,
        SpinnerComponent,
        DecimalPipe,
        TooltipDirective,
        ModalComponent,
        C3ChartComponent,
        NgClass,
        SelectListComponent,
        FormsModule
    ],
    templateUrl: './game-profits-page.component.html',
    styleUrl: './game-profits-page.component.scss'
})
export class GameProfitsPageComponent implements OnInit {

  gameId: number = 0;

  response: IGameProfitResponse | null = null;
  profits: Record<string, IProfitMarket[][]> | null = null;

  //popover : any | null = null;
  chartData: any | null = null;
  chartTitle: string | null = null;

  @ViewChild('chartModal')
  chartModal!: ModalComponent;

  filter: IProfitFilter = {
    thisLeague: false,
    sameGames: false,
    homeAWay: false,
    bookieId: undefined,
    limit: 25
  };

  bookies: ISelectListItem[] = [
    {value: '2', text: 'Marathonbet'},
    {value: '4', text: 'Pinnacle'},
    {value: '7', text: 'William Hill'},
    {value: '8', text: 'Bet365'},
    {value: '11', text: '1xBet'},
    {value: '16', text: 'Unibet'},
    {value: '33', text: 'Fonbet'}
  ];

  limitList: ISelectListItem[] = [5, 10, 15, 20, 25, 30, 50, 100].map(i => ({text: i.toString(), value: i}));

  loading = false;
  private filterSubject = new Subject<IProfitFilter>();

  constructor(private dateRepo: DataRepoService, private gameContext: GameContextService, private scriptsLoaderService: ScriptLoaderService,
              private titleService: Title, private metaService: Meta) {

    gameContext.gameId.pipe(untilDestroyed(this)).subscribe(val => {
      this.gameId = val;
      this.load(val);
    });

    this.filterSubject.pipe(untilDestroyed(this)).pipe(debounceTime(400)).subscribe((searchValue) => {
      this.load(this.gameId);
    });

    gameContext.game.pipe(untilDestroyed(this)).subscribe(async game => {
      if(!game) return;

      let title = `${game.HomeTeam.Name} - ${game.AwayTeam.Name}, ${format(parseISO(game.Date),'dd.MM.yyyy')}: Профиты, прибыль, тенденции, тренды :: Stats.net`;

      titleService.setTitle(title);
      metaService.updateTag({name: 'description', content: "Найти тренды, тенденции для ставок, похожиме матчи. Прибильная стратегия"});
      metaService.updateTag({
        name: 'keywords',
        content: "тренды,тенденции,закономерности,ставки,коэффициенты"
      });
    })
  }

  async ngOnInit() {
    await this.scriptsLoaderService.loadC3Scripts();
  }

  async load(gameId: number) {
    this.loading = true;
    this.response = null;
    this.profits = null;

    this.response = await this.dateRepo.getProfits(gameId, this.filter);

    if (this.response) {
      this.profits = {
        'full-time': [this.response.home, this.response.away],
        'first-half': [this.response.homeFirstHalf, this.response.awayFirstHalf],
        'second-half': [this.response.homeSecondHalf, this.response.awaySecondHalf]
      };
    }
    this.loading = false;
  }

  round(num: number) {
    return Math.round(num);
  }

  getColor(outcome: IProfitOutcome) {
    if (outcome.GamesCount < 5) return undefined;

    if (outcome.Value >= 5)
      return '#133c1f';
    if (outcome.Value >= 3)
      return '#2e683f';
    if (outcome.Value >= 1)
      return '#374937';

    if (outcome.Value <= -3)
      return '#972f2f';
    if (outcome.Value <= -1)
      return '#4a3535';


    return undefined;
  }


  openProfitChart(event: MouseEvent, market: IProfitMarket, outcome: IProfitOutcome) {
    this.chartTitle = market.market + ": " + outcome.Name + " — изменение прибыли";
    this.chartData = {
      data: {
        columns: [
          ['profit', ...outcome.History],
        ],
        // color: function (color : any, d : any) {
        //   // d will be 'id' when called for legends
        //   //return d.id && d.id === 'data3' ? d3.rgb(color).darker(d.value / 150) : color;
        //   console.debug(color, d);
        //   return d.value < 0 ? '#cf3955' : color;
        // }
      },
      axis : {
        x : {
          label : "Количество ставок"
        },
        y : {
          label : "Прибыль"
        }
      },
      grid: {
        y: {
          show : true,
          lines: [{value: 0, class: 'grid-zero-line', text : ''}]
        }
      }
    };

    this.chartModal.open();
    console.debug("profit history", outcome.History)
  }

  filterChanged(event?: any) {
    this.filterSubject.next(this.filter);
  }
}

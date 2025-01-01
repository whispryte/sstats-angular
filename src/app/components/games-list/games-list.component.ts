import {AfterViewInit, booleanAttribute, Component, ElementRef, Input, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {IApiSaFixture, IApiSaLeague} from "../../models/ApiSaModels";
import {GamesListItemComponent} from "../games-list-item/games-list-item.component";

@Component({
    selector: 'app-games-list',
    imports: [CommonModule, GamesListItemComponent],
    templateUrl: './games-list.component.html',
    styleUrl: './games-list.component.scss',
    host: { class: 'd-block' }
})
export class GamesListComponent implements AfterViewInit{
  @Input({required: true})
  games! : IApiSaFixture[];

  @Input()
  league! : IApiSaLeague | null;

  @Input({transform : booleanAttribute})
  header : boolean = false;

  @Input({transform : booleanAttribute})
  compact : boolean = false;

  @Input()
  winForTeam? : number;

  @ViewChild('containerEl') containerEl? : ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    let tooltipsEl = this.containerEl?.nativeElement.querySelectorAll('.header-tooltip')

    tooltipsEl?.forEach(i=>{
      // @ts-ignore
      new bootstrap.Tooltip(i);
    })

  }
}

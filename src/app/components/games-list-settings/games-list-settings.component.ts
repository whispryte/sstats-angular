import { Component } from '@angular/core';
import {SelectListComponent} from "../../ui/select-list/select-list.component";
import {CommonModule} from "@angular/common";
import {StorageService} from "../../services/storage.service";

@Component({
    selector: 'app-games-list-settings',
    imports: [
        CommonModule, SelectListComponent
    ],
    templateUrl: './games-list-settings.component.html',
    styleUrl: './games-list-settings.component.scss'
})
export class GamesListSettingsComponent {
  sortItems = [
    {
      text : "По турнирам",
      value : 1
    },
    {
      text: "По времени",
      value : 2
    }
  ]

  oddsItems = [
    {text : "1X2", value: "1X2"},
    {text : "Double Chance", value: "DC"},
    {text : "Draw no bet", value: "DNB"},
    {text : "Total Over/Under", value: "Total"},
  ];

  constructor(public storage : StorageService) {
  }
}

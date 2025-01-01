import { Component } from '@angular/core';
import {NgIf} from "@angular/common";
import {Router, RouterLink} from "@angular/router";
import {Meta} from "@angular/platform-browser";

@Component({
    selector: 'app-api-page',
    imports: [
        NgIf,
        RouterLink
    ],
    templateUrl: './api-page.component.html',
    styleUrl: './api-page.component.scss',
    host: { class: 'd-flex flex-column flex-grow-1' }
})
export class ApiPageComponent {
  constructor(private metaService : Meta) {
    this.metaService.updateTag({name: 'description', content: "Football API, бесплатное API, база данных футбольных матчей, csv, json, скачать"});
    this.metaService.updateTag({
      name: 'keywords',
      content: "api,xg,glicko,profit,json,csv,бесплатно,база данных"
    });
  }
}

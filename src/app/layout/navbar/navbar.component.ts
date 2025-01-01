import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterLink} from "@angular/router";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {StorageService} from "../../services/storage.service";
import {AppService} from "../../services/app.service";

@Component({
    selector: '[app-navbar]',
    imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  timeZonesItems = ['-11:00', '-10:00','-09:00', '-08:00', '-07:00', '-06:00', '-05:00', '-04:00', '-03:00', '-02:00',
    '-01:00', '+00:00', '+01:00', '+02:00', '+03:00', '+04:00', '+05:00', '+06:00', '+07:00',
    '+08:00', '+09:00', '+10:00', '+11:00', '+12:00']
    .map(i => ({name: i, offset: parseInt(i.split(':')[0]) * 60 + parseInt(i.split(':')[1])}));


  constructor(public storage : StorageService, public appService: AppService) {
  }

  protected readonly HTMLDivElement = HTMLDivElement;
  protected readonly parseInt = parseInt;
}

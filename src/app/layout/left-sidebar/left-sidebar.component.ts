import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TournamentListComponent} from "../../components/tornament-list/tournament-list.component";
import {RouterLink} from "@angular/router";

@Component({
    selector: '[app-left-sidebar]',
    imports: [CommonModule, TournamentListComponent],
    templateUrl: './left-sidebar.component.html',
    styleUrl: './left-sidebar.component.scss'
})
export class LeftSidebarComponent {

}

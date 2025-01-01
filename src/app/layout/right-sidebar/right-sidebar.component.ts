import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FavouriteGamesComponent} from "../../components/favourite-games/favourite-games.component";

@Component({
    selector: '[app-right-sidebar]',
    imports: [CommonModule, FavouriteGamesComponent],
    templateUrl: './right-sidebar.component.html',
    styleUrl: './right-sidebar.component.scss'
})
export class RightSidebarComponent {

}

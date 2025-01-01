import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgIf} from "@angular/common";

@Component({
    selector: 'app-fav-star',
    imports: [
        NgIf
    ],
    templateUrl: './fav-star.component.html',
    styleUrl: './fav-star.component.scss'
})
export class FavStarComponent {
  @Input()
  selected : boolean = false;

  @Output()
  selectedChange  = new EventEmitter<boolean>();


  clicked(event : MouseEvent){
    event.preventDefault();
    event.stopPropagation();


    this.selectedChange.emit(!this.selected);
    this.selected = !this.selected;

  }
}

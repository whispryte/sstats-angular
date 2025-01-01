import {Component, Input} from '@angular/core';
import {CommonModule} from "@angular/common";
import {RouterOutlet} from "@angular/router";

@Component({
    selector: 'app-spinner',
    imports: [CommonModule],
    templateUrl: './spinner.component.html',
    styleUrls: ['./spinner.component.scss'],
    host: { class: 'w-md-100' }
})
export class SpinnerComponent {
  @Input()
  size? : number;
}

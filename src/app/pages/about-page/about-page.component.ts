import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-about-page',
    imports: [CommonModule],
    templateUrl: './about-page.component.html',
    styleUrl: './about-page.component.scss',
    host: { class: 'd-flex flex-column flex-grow-1' }
})
export class AboutPageComponent {

}

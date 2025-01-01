import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-news-view-page',
    imports: [CommonModule],
    templateUrl: './news-view-page.component.html',
    styleUrl: './news-view-page.component.scss',
    host: { class: 'd-flex flex-column flex-grow-1' }
})
export class NewsViewPageComponent {

}

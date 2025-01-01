import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-news-page',
    imports: [CommonModule],
    templateUrl: './news-page.component.html',
    styleUrl: './news-page.component.scss',
    host: { class: 'd-flex flex-column flex-grow-1' }
})
export class NewsPageComponent {

}

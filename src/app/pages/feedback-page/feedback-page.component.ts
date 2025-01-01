import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-feedback-page',
    imports: [CommonModule],
    templateUrl: './feedback-page.component.html',
    styleUrl: './feedback-page.component.scss',
    host: { class: 'd-flex flex-column flex-grow-1' }
})
export class FeedbackPageComponent {

}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-message-board-page',
    imports: [CommonModule],
    templateUrl: './message-board-page.component.html',
    styleUrl: './message-board-page.component.scss',
    host: { class: 'd-flex flex-column flex-grow-1' }
})
export class MessageBoardPageComponent {

}

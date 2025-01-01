import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {CommonModule} from "@angular/common";

export interface IModalButton {
  title: string;
  func: (event : MouseEvent) => void;
}

@Component({
    selector: 'app-modal',
    imports: [CommonModule],
    templateUrl: './modal.component.html',
    styleUrl: './modal.component.scss'
})
export class ModalComponent implements AfterViewInit {

  @ViewChild("modal", {read: ElementRef}) modalContainer!: ElementRef<HTMLDivElement>;

  @Input() title: string | null = null;

  buttons: IModalButton[] = [];

  modal: any;

  public open(buttons? : IModalButton[]) {
    this.buttons = buttons ?? [];
    this.modal.toggle();

  }

  ngAfterViewInit(): void {
    // @ts-ignore
    this.modal = new bootstrap.Modal(this.modalContainer.nativeElement, {
      keyboard: false
    })
  }
}

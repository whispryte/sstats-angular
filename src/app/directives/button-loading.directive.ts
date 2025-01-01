import {Directive, ElementRef, Input, OnChanges, SimpleChanges} from '@angular/core';

@Directive({
  selector: '[appButtonLoading]',
  standalone: true
})
export class ButtonLoadingDirective implements OnChanges {

  @Input()
  appButtonLoading: boolean = false;

  constructor(private el: ElementRef<HTMLButtonElement>) {
    el.nativeElement.innerHTML = `<i class='ph-spinner spinner me-1' style="display: none"></i> ${el.nativeElement.innerHTML}`;
    this.update();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.update();
  }

  update() {
    this.el.nativeElement.disabled = this.appButtonLoading;

    if(this.appButtonLoading){
      this.el.nativeElement.classList.add('loading');
      (this.el.nativeElement.children[0] as HTMLElement).style.display = 'inline-block';
    }else{
      this.el.nativeElement.classList.remove('loading');
      (this.el.nativeElement.children[0] as HTMLElement).style.display = 'none';
    }
  }
}

import {Directive, ElementRef, Input, OnInit} from '@angular/core';

@Directive({
  selector: '[appPopover]',
  standalone: true
})
export class PopoverDirective implements OnInit {

  @Input()
  appPopover: string = "";

  constructor(private el: ElementRef) {
  }

  ngOnInit(): void {
    // @ts-ignore
    var popover = new bootstrap.Popover(this.el.nativeElement, {
      trigger: 'focus',
      content: this.appPopover,
      html : true
    })

  }

}

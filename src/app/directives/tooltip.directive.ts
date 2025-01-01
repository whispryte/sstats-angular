import {Directive, ElementRef, Input, OnInit} from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnInit {

  @Input()
  appTooltip : string = "";

  constructor(private el: ElementRef) {

  }

  ngOnInit(): void {
    // @ts-ignore
    var tooltip = new bootstrap.Tooltip(this.el.nativeElement, {
      title : this.appTooltip || "title",
    });
  }

}

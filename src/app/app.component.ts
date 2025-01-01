import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink, RouterOutlet} from '@angular/router';
import {NavbarComponent} from "./layout/navbar/navbar.component";
import {LeftSidebarComponent} from "./layout/left-sidebar/left-sidebar.component";
import {RightSidebarComponent} from "./layout/right-sidebar/right-sidebar.component";
import {} from "@angular/common/http";
import {Meta, Title} from "@angular/platform-browser";
import {StorageService} from "./services/storage.service";

@Component({
    selector: '[app-root]',
    imports: [CommonModule, RouterOutlet, NavbarComponent, LeftSidebarComponent, RightSidebarComponent, RouterLink],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'sstats-ng17';
  date = new Date();

  // @ts-ignore
  version = require('../../package.json').version

  @ViewChild('contentWrapper')
  contentWrapper!: ElementRef<HTMLDivElement>;

  containerWrapperResizeObserver?: ResizeObserver;

  constructor(private titleService: Title, private storage: StorageService, private metaService : Meta) {
    //titleService.setTitle('')
    //metaService.updateTag({ name: 'keywords', content: 'football,soccer,glicko,api,free,profit,excel'});
  }

  ngAfterViewInit(): void {
    console.debug("init app");
    this.initContentResizeObserver();
  }

  initContentResizeObserver(): void {
    new ResizeObserver((entries) => {
      let width = entries[0].contentBoxSize[0].inlineSize;
      if (width < 860)
        this.storage.compactContent.next(true);
      if (width > 890)
        this.storage.compactContent.next(false);
    }).observe(this.contentWrapper.nativeElement);

    this.storage.compactContent.next(this.contentWrapper.nativeElement.offsetWidth < 860);
  }
}

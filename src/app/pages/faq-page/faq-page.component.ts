import {AfterViewInit, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AppService} from "../../services/app.service";
import {IFaqGroup} from "../../models/ApiModels";

@Component({
    selector: 'app-faq-page',
    imports: [CommonModule],
    templateUrl: './faq-page.component.html',
    styleUrl: './faq-page.component.scss',
    host: { class: 'd-flex flex-column flex-grow-1' }
})
export class FaqPageComponent implements AfterViewInit {

  faqGroups : IFaqGroup[] = [];

  constructor(private appService: AppService) {
  }

  async ngAfterViewInit() {
    this.faqGroups = await this.appService.GetFaq() ?? [];
  }

  scrollToCategory(group : IFaqGroup) {
    let el = document.getElementById('faq_group_' + group.Category.Id);
    if(!el) return;
    el.scrollIntoView();
  }
}

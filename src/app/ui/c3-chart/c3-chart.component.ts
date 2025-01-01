import {AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {ScriptLoaderService} from "../../services/script-loader.service";

@Component({
    selector: 'app-c3-chart',
    imports: [],
    templateUrl: './c3-chart.component.html',
    styleUrl: './c3-chart.component.scss'
})
export class C3ChartComponent implements AfterViewInit, OnChanges {
  @Input()
  data: any;

  @ViewChild('chart')
  chart!: ElementRef<HTMLDivElement>;

  c3Chart: any | null = null;

  constructor(private scriptLoaderService: ScriptLoaderService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.c3Chart) return;

    if (changes['data']) {
      this.c3Chart.load(changes['data'].currentValue.data);
    }
  }

  async ngAfterViewInit(): Promise<void> {
    await this.scriptLoaderService.loadC3Scripts();

    // @ts-ignore
    this.c3Chart = c3.generate({
      bindto: this.chart.nativeElement,
      grid: {
        x: {
          show: true
        },
        y: {
          show: true
        }
      },
      ...this.data,
      size: {
        width: 750
      }
    });
  }

}

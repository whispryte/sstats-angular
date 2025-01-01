import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  Renderer2, SimpleChanges
} from '@angular/core';
import {
  startOfMonth,
  addDays,
  getDaysInMonth,
  format,
  addMonths,
  getISODay,
  addWeeks,
  getISOWeek,
  startOfDay, endOfISOWeek, endOfDay
} from 'date-fns'
import {CommonModule} from "@angular/common";
import {RouterOutlet} from "@angular/router";

interface IWeek {
  label: string;
  days: IDay[];
  isActive?: boolean
}

interface IDay {
  label: string,
  date: Date,
  isDisabled?: boolean,
  isActive?: boolean
}

export interface IDateRange {
  startDate: Date;
  endDate?: Date;
}

export interface IWeekPickerOptions extends IDateRange {

}


@Component({
    selector: 'week-picker',
    imports: [CommonModule],
    templateUrl: './week-picker.component.html',
    styleUrls: ['./week-picker.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeekPickerComponent implements OnInit{

  @Input() params?: IWeekPickerOptions;

  @Input() date!: IDateRange
  @Output() dateChange: EventEmitter<IDateRange> = new EventEmitter();

  weeks: IWeek[] = [];
  isMenuVisible: boolean = false;
  //pickedDate: Date;
  calendarFirstDay: Date = new Date();

  //isWeekPicked: boolean;


  constructor(private renderer: Renderer2, private nativeElement: ElementRef, private cdr: ChangeDetectorRef) {
    //this.pickedDate = this.date?.startDate ?? new Date();
    // this.calendarFirstDay = this.date.startDate;
    // this.refreshWeeks();
    // this.isMenuVisible = false;

    //this.isWeekPicked = this.date?.endDate != null;

    this.renderer.listen('window', 'click', (e: PointerEvent) => {
      if (!this.nativeElement.nativeElement.firstElementChild.contains(e.target as HTMLElement)) {
        if (this.isMenuVisible) {
          this.isMenuVisible = false;
          cdr.detectChanges();
        }
      }
    });
  }

  ngOnInit(): void {
    this.calendarFirstDay = this.date.startDate;
    this.refreshWeeks();
    this.isMenuVisible = false;
  }

  getPickedLabel(): string {
    //return SerializeRange(this.date);
    let s = format(this.date.startDate, 'dd.MM.yy');
    if(this.date.endDate){
      return s + " - " + format(this.date.endDate!, 'dd.MM.yy');
    }
    return s;
  }

  refreshWeeks() {

    let now = this.calendarFirstDay;
    let monthStart = startOfMonth(now);
    let weeks: IWeek[] = [{label: 'w 1', days: []}];
    let daysInMonth = getDaysInMonth(now);

    let wc = 1;
    let md = getISODay(monthStart);
    if (md != 1) {
      for (let i = 1; i < md; i++) {
        let d = addDays(monthStart, -i);
        weeks[0].days.push({label: d.getDate().toString(), date: d, isDisabled: true});
      }
      weeks[0].days = weeks[0].days.reverse();
    }

    let d: Date = new Date();
    for (let i = 0; i < daysInMonth; i++) {
      d = addDays(monthStart, i);
      if (i != 0 && getISODay(d) == 1) {
        wc++;
        weeks.push({label: 'w ' + wc, days: []});
      }
      let w = weeks[weeks.length - 1];
      w.days.push({
        label: d.getDate().toString().padStart(2, '0'),
        date: d,
        isActive: inRange(d, this.date.startDate, this.date.endDate)
      });
    }

    if (getISODay(d) != 7) {
      for (let i = getISODay(d) + 1; i <= 7; i++) {
        d = addDays(d, 1);
        weeks[weeks.length - 1].days.push({label: d.getDate().toString().padStart(2, '0'), date: d, isDisabled: true})
      }
    }

    for (let w of weeks) {
      w.isActive = w.days.every(i=>i.isActive);
    }


    this.weeks = weeks;
  }

  dayClick(date: IDay) {
    if (date.isDisabled)
      return;

    // this.pickedDate = date.date;
    // this.isWeekPicked = false;
    this.isMenuVisible = false;
    this.date = {startDate: date.date};

    this.dateChange.emit(this.date)
  }

  toggleMenu() {
    this.isMenuVisible = !this.isMenuVisible;
    if (this.isMenuVisible) {
      let sm = startOfMonth(this.date.startDate);
      if (this.calendarFirstDay != sm) {
        this.calendarFirstDay = sm;
        this.refreshWeeks();
      }
    }
  }

  weekClick(week: IWeek) {
    this.date = {startDate : week.days[0].date, endDate : week.days[6].date};
    this.isMenuVisible = false;
    this.dateChange.emit(this.date)
  }

  getMonth() {
    return format(this.calendarFirstDay, "MMMM yyyy");
  }

  getDayLabels() {
    return ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  }

  nextDayClick() {
    if (this.isMenuVisible) {
      this.calendarFirstDay = addMonths(this.calendarFirstDay, 1);
    } else if (this.date.endDate) {
      this.date = {startDate :  addDays(this.date.endDate, 1)}
    } else {
      this.date = {startDate : addDays(this.date.startDate, 1)};
    }
    this.refreshWeeks();
    this.dateChange.emit(this.date)
    console.debug("date changed", this.date);

  }

  previousDayClick() {
    if (this.isMenuVisible) {
      this.calendarFirstDay = addMonths(this.calendarFirstDay, -1);
    } else {
      this.date = {startDate : addDays(this.date.startDate, -1)};
    }
    this.refreshWeeks();
    this.dateChange.emit(this.date);
    console.debug("date changed", this.date);
  }

  todayClick() {
    this.date = { startDate : startOfDay(new Date())};
    this.isMenuVisible = false;
    this.dateChange.emit(this.date)
  }

  sameDates(d1: Date, d2: Date) {
    return d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate();
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   console.debug("week peecker changed", changes);
  //
  //   if (SerializeRange(changes["date"].currentValue) != SerializeRange(changes["date"].previousValue)) {
  //     const range: IDateRange = changes["date"].currentValue;
  //     this.pickedDate = range.startDate;
  //     this.isWeekPicked = false;
  //   }
  // }
}

export function SerializeRange(dateRange: IDateRange | null) {
  if (!dateRange?.startDate) return "";
  let s = format(dateRange.startDate, 'yyyy-MM-dd');
  if (dateRange.endDate) {
    s += "--" + format(dateRange.endDate, 'yyyy-MM-dd');
  }
  return s;
}


function inRange(date: Date, from : Date, end? :Date){
  if(!end)
    return date.getFullYear() == from.getFullYear() && date.getMonth() == from.getMonth() && date.getDate() == from.getDate();
  return date >= startOfDay(from) && date <= endOfDay(end);
}

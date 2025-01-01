import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from "@angular/common";


export interface ISelectListItem {
  text: string,
  value: any
}

@Component({
    selector: 'app-select-list',
    imports: [CommonModule],
    templateUrl: './select-list.component.html',
    styleUrl: './select-list.component.scss'
})
export class SelectListComponent {
  @Input()
  items!: ISelectListItem[];

  @Input()
  value: any | any[];
  @Output() valueChange = new EventEmitter<any>();

  @Input()
  multiselect: boolean = false;

  @Input()
  maxSelected : number = 0;

  @Input()
  allowClear : boolean = false;

  get label() {
    let s = this.selected;
    if (!s || (<any[]>s).length == 0) {
      return "--Не выбрано--"
    }
    if (Array.isArray(s)) {
      return s.map(i => i.text).join(", ");
    }
    return s.text ?? this.value ?? "-- Не выбрано --";
  }

  get selected() {
    if (Array.isArray(this.value)) {
      return this.items.filter(i => this.value.includes(i.value));
    }
    return this.items.find(i => i.value == this.value);
  }

  get selectedCount(){
    return Array.isArray(this.value) ? this.value.length : 1;
  }

  isSelected(val: any) {
    return val == this.value || Array.isArray(this.value) && this.value.includes(val);
  }

  isDisabled(val: any) {
    return this.maxSelected != 0 && this.selectedCount >= this.maxSelected && !this.isSelected(val);
  }


  select(item: ISelectListItem, event: MouseEvent) {
    if (this.multiselect) {
      event.stopPropagation();

      if(this.maxSelected > 0 && !this.isSelected(item.value) && this.selectedCount >= this.maxSelected){
        return;
      }

      if (!this.value) {
        this.value = [];
      } else if (!Array.isArray(this.value)) {
        this.value = [this.value]
      }
      if (this.value.includes(item.value)) {
        this.value = this.value.filter((i: any) => i != item.value);
      } else {
        this.value.push(item.value);
      }
      this.valueChange.emit(this.value);
      return;
    }

    this.value = item.value;
    this.valueChange.emit(item.value);
  }

  reset(){
    this.value = undefined;
    this.valueChange.emit(this.value);
  }
}

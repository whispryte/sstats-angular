import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'oddsNum',
  standalone: true
})
export class OddsNumPipe implements PipeTransform {

  transform(value?: number, ...args: unknown[]): number | null {
    if(value==null) return null;
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

}

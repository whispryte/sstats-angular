import { Injectable } from '@angular/core';
import {BehaviorSubject, ReplaySubject} from "rxjs";
import {IApiSaFixtureFull} from "../models/ApiSaModels";

@Injectable()
export class GameContextService {

  gameId : ReplaySubject<number> = new ReplaySubject<number>(1);
  game : BehaviorSubject<IApiSaFixtureFull | null> = new BehaviorSubject<IApiSaFixtureFull | null>(null);

  constructor() {
  }
}

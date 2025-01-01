import {IApiSaCountry, IApiSaFixture} from "./models/ApiSaModels";
import {HttpEvent, HttpHandlerFn, HttpRequest} from "@angular/common/http";
import {Observable} from "rxjs";

export function getSapiCountryFlag(saCountry : IApiSaCountry){
  if(saCountry.Abbr == 'WW')
    return 'un';
  return  saCountry.Abbr?.toLowerCase();
}


export function getGameStatusName(status : number){
  return gameStatuses[status] ?? status;
}

const gameStatuses : Record<number, string>  = {
  1: "Time To Be Defined",
  2: "Not Started",
  3: "First Half - Kick Off",
  4: "Halftime",
  5: "Second Half Started",
  6: "Extra Time",
  7: "Penalty In Progress",
  8: "Match Finished",
  9: "Match Finished After Extra Time",
  10: "Match Finished After Penalty",
  11: "Break Time in Extra Time",
  12: "Match Suspended",
  13: "Match Interrupted",
  14: "Match Postponed",
  15: "Match Cancelled",
  16: "Match Abandoned",
  17: "Technical Loss",
  18: "WalkOver",
  19: "In Progress"
}


export function gameIsFinished(status : number){
  return [8, 9, 10, 17].includes(status);
}


export function getGameWinner(game : IApiSaFixture){
  if(game.ScoreAwayFT == null || game.ScoreHomeFT == null) return null;
  if(game.ScoreHomeFT > game.ScoreAwayFT) return game.HomeTeam.Id;
  if(game.ScoreAwayFT > game.ScoreHomeFT) return game.AwayTeam.Id;
  return 0;
}

export function getMargin(odds : number[]){
  return odds.reduce((prev,cur)=> prev + 1/cur, 0) - 1;
}

export function getTrueOdds(odds : number[]){
  const margin = getMargin(odds);
  return odds.map(i=>(odds.length * i) / (odds.length - margin * i));
}

export function getProbabilities(odds : number[]){
  return getTrueOdds(odds).map(i=>1/i);
}

export function roundNum(num : number){
  // @ts-ignore
  return +(Math.round((num) + "e+2") + "e-2");
}

export function generateRandomString(length : number) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);
  randomArray.forEach((number) => {
    result += chars[number % chars.length];
  });
  return result;
}

const sweetAlertButtonStyles = {
  confirmButton: 'btn btn-primary',
  cancelButton: 'btn btn-light',
  denyButton: 'btn btn-light',
  input: 'form-control'
};

export function showSuccessAlert(title : string, text? : string) {
  // @ts-ignore
  const swalInit = swal.mixin({
    buttonsStyling: false,
    customClass: sweetAlertButtonStyles
  });

  swalInit.fire({
    title: title,
    text: text,
    icon: 'success'
  })
}


export function showConfirmAlert(title : string, text? : string, confirmBtnText?: string) {
  // @ts-ignore
  const swalInit = swal.mixin({
    buttonsStyling: false,
    showCancelButton: true,
    confirmButtonText: confirmBtnText ?? "Подтвердить",
    cancelButtonText : "Отмена",
    denyButtonText: `Don't save`,
    customClass: sweetAlertButtonStyles
  });

  return  swalInit.fire({
    title: title,
    text: text,
    icon: 'question'
  }) as Promise<{isConfirmed : boolean, isDenied : boolean}>
}

export function loggingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  //console.log(req.url);
  const apiReq = req.clone({ url: `https://sstats.net${req.url}` });
  return next(apiReq);
}

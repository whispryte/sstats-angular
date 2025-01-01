import {Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {StorageService} from "./storage.service";
import {BehaviorSubject, catchError, firstValueFrom, of, throwError} from "rxjs";
import {
  IApiResponse,
  IAppUser,
  IAppUserInfo,
  IFaqGroup,
  IUserRegisterModel,
  IUserSettingsSaveModel
} from "../models/ApiModels";
import {CookieService} from "ngx-cookie-service";

@Injectable({
  providedIn: 'root'
})
export class AppService {

  currentUser: WritableSignal<IAppUser | null> = signal(null);

  get isLogged() {
    return !!this.currentUser();
  }

  constructor(private http: HttpClient, private storage: StorageService, private cookieService: CookieService) {
    let curUserStr = cookieService.get("currentUser");
    if (curUserStr) {
      this.currentUser.set(JSON.parse(curUserStr));
    } else {
      this.refreshCurrentUser();
    }
  }

  async login(userName: string, password: string) {
    let result = await firstValueFrom(this.http.post<IApiResponse<IAppUser>>("/api/account/login", {
      UserName: userName,
      Password: password
    }));

    if (result.status == "OK" && result.data) {
      this.currentUser.set(result.data);
      this.cookieService.set("currentUser", JSON.stringify(result.data));
    }

    return result;
  }

  async logout() {
    let result = await firstValueFrom(this.http.get<IApiResponse<null>>("/api/account/logout"));
    this.currentUser.set(null);
    this.cookieService.delete("currentUser");
    return result.status == "OK";
  }

  async refreshCurrentUser() {
    try {
      let result = await firstValueFrom(this.http.get<IApiResponse<IAppUser>>("/api/account/CurrentUser")
        .pipe(catchError((err, o) => {
          return of(null);
        })));


      if (result?.status == "OK" && result?.data) {
        this.currentUser.set(result.data);
      }
    } catch (err) {
      this.currentUser.set(null);
      console.warn(err);
    }
  }

  async GetUserInfo() {
    let res = await firstValueFrom(this.http.get<IApiResponse<IAppUserInfo>>("/api/account/GetUserInfo"));
    return res.data;
  }

  async GenerateNewApiKey() {
    let res = await firstValueFrom(this.http.get<IApiResponse<{ key: string }>>("/api/account/GenerateNewApiKey"));
    return res.data?.key;
  }

  async SaveSettings(settings: IUserSettingsSaveModel) {
    let res = await firstValueFrom(this.http.post<IApiResponse<null>>("/api/account/SetSettings", settings));
    return res.status == "OK" && res.data;
  }

  async Register(data : IUserRegisterModel){
    let res = await firstValueFrom(this.http.post<IApiResponse<{UserId : number}>>("/api/account/Register", data));
    return res.data;
  }

  async GetFaq(){
    let res = await firstValueFrom(this.http.get<IApiResponse<IFaqGroup[]>>("/api/home/faq"));
    return res.data;
  }
}

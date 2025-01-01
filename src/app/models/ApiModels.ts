export enum GamesFilterFlags {
  Today = 1,
  Upcoming = 2,
  Ended = 2 << 1,
  Recent = 2 << 2,
  PopularInCountry = 2 << 3,
  All = 2 << 4
}

export interface IApiResponse<T> {
  status: "OK" | "error";
  message?: string | null;
  data?: T;
}

export interface IAppUser {
  UserName: string;
  Id: number;
  Roles: string[]
}

export interface IAppUserInfo extends IAppUser {
  Email: string | null;
  RegistrationDate: string | null;
  ApiKey: string | null;
  Subscriptions: IAppUserSubscription[] | null;
}

export interface IAppUserSubscription {
  Name: string;
  RequestsPerMinute: string;
  Start: string;
  End: string;
}

export interface IUserSettingsSaveModel {
  Email: string;
  Password: string | null;
  ConfirmPassword: string | null;
}

export interface IUserRegisterModel extends IUserSettingsSaveModel {
  UserName: string;
}

export interface IFaqCategory {
  Id : number;
  Name: string;
  Description: string | null;
}

export interface IFaqItem {
  Id : number;
  Title : string;
  Content: string;
  Updated : string;
}

export interface IFaqGroup{
  Category : IFaqCategory;
  Items: IFaqItem[];
}

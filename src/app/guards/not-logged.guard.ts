import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {AppService} from "../services/app.service";

export const notLoggedGuard: CanActivateFn = (route, state) => {
  const appService = inject(AppService);

  if(appService.isLogged){
    const router = inject(Router);
    router.navigate(['/']);
    return false;
  }

  return true;
};

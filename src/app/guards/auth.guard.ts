import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {AppService} from "../services/app.service";

export const authGuard: CanActivateFn = (route, state) => {
  const appService = inject(AppService);

  if(!appService.isLogged){
    const router = inject(Router);
    router.navigate(['/login']);
    return false;
  }

  return true;
};

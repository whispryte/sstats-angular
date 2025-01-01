import {Component, ViewChild} from '@angular/core';
import {FormGroup, FormsModule, NgForm} from "@angular/forms";
import {ButtonLoadingDirective} from "../../directives/button-loading.directive";
import {AppService} from "../../services/app.service";
import {Router} from "@angular/router";
import {NgIf} from "@angular/common";
import {IUserRegisterModel} from "../../models/ApiModels";
import {showSuccessAlert} from "../../helpers";

@Component({
    selector: 'app-login-page',
    imports: [
        FormsModule,
        ButtonLoadingDirective,
        NgIf
    ],
    templateUrl: './login-page.component.html',
    styleUrl: './login-page.component.scss',
    host: { class: 'd-flex flex-column flex-grow-1' }
})
export class LoginPageComponent {
  tab = 0;

  userName: string = "";
  password: string = "";

  @ViewChild('loginForm') loginForm!: NgForm;
  @ViewChild('registerForm')
  registerForm!: NgForm;

  @ViewChild('acceptCheckbox')
  acceptCheckbox! : HTMLInputElement;

  registerData : IUserRegisterModel = {
    UserName : "",
    Email : "",
    Password: "",
    ConfirmPassword: "",
  }

  loading = false;

  error: string | null = null;

  constructor(private appService: AppService, private router: Router) {
  }

  async login(event: MouseEvent) {
    console.log("login form", this.loginForm.form);

    this.error = null;

    if (!this.loginForm.valid) {
      for (let f in this.loginForm.form.controls) {
        this.loginForm.controls[f].markAsTouched();
      }
      return;
    }

    this.loading = true;

    try {
      let response = await this.appService.login(this.userName, this.password);
      if (response.status == "OK") {
        this.router.navigate(['/']);
      } else {
        this.error = response.message || null;
      }
    } catch (error: any) {
      this.error = error?.message || error;
    } finally {
      this.loading = false;
    }
  }

  async register(){

    console.debug("reg form", this.registerForm);

    if(!this.registerForm.valid){
      for (let f in this.registerForm.form.controls) {
        this.registerForm.controls[f].markAsTouched();
      }
      return;
    }

    if(this.registerData.Password != this.registerData.ConfirmPassword){
      this.registerForm.controls['confirmPassword'].setErrors({'notSame' : 'Пароли не совпадают'});
    }

    this.loading = true;

    try{
      let res = await this.appService.Register(this.registerData);
      if(res?.UserId){
        // @ts-ignore
        new bootstrap.Tab(document.getElementById('login-tab-link')).show()
        this.registerForm.resetForm();
        showSuccessAlert("Регистрация прошла успешно", "Теперь вы можете войти и использованием логина и пароля");
      }
    }catch(error){
      console.error(error);
    }

    this.loading = false;
  }
}

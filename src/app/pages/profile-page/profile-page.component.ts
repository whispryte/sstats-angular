import {AfterViewInit, Component, effect, ViewChild} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {IAppUser, IAppUserInfo} from "../../models/ApiModels";
import {AppService} from "../../services/app.service";
import {JsonPipe, KeyValuePipe, NgForOf, NgIf} from "@angular/common";
import {SpinnerComponent} from "../../ui/spinner/spinner.component";
import {FormControl, FormGroup, FormsModule, NgForm, ReactiveFormsModule} from "@angular/forms";
import {generateRandomString, showConfirmAlert, showSuccessAlert} from "../../helpers";
import {ButtonLoadingDirective} from "../../directives/button-loading.directive";

@Component({
    selector: 'app-profile-page',
    imports: [
        RouterLink,
        NgForOf,
        NgIf,
        SpinnerComponent,
        FormsModule,
        ButtonLoadingDirective,
        ReactiveFormsModule
    ],
    templateUrl: './profile-page.component.html',
    styleUrl: './profile-page.component.scss',
    host: { class: 'd-flex flex-column flex-grow-1' }
})
export class ProfilePageComponent implements AfterViewInit {
  user: IAppUserInfo | null = null;

  userModel: IAppUserInfo | null = null;

  saving = false;

  password: string | null = null;
  confirmPassword: string | null = null;

  @ViewChild('settingsForm')
  settingsForm! : NgForm;

  constructor(private appService: AppService, private router: Router) {

  }

  async ngAfterViewInit() {
    let user = await this.appService.GetUserInfo();

    if (user) {
      this.user = user;
      this.userModel = structuredClone(user);
    }
  }

  async generateApiKey() {

    if (!this.userModel || !this.user) return;

    let confirmRes = await showConfirmAlert("Сгенерировать новый ключ?", "Заменить API-ключ на новый? Доступ по старому ключу будет отключен", "Сгенерировать");

    if (!confirmRes.isConfirmed) return;

    this.saving = true;

    let newKey = await this.appService.GenerateNewApiKey();
    if (newKey) {
      this.user.ApiKey = newKey;
      this.userModel.ApiKey = newKey;
    }

    this.saving = false;

    showSuccessAlert("Ключ сохранен", "Новый API-ключ успешно сгенерирован и сохранен. Доступ по старому ключу будет отключен")
  }

  resetSettings() {
    //this.settingsForm.resetForm();
    this.userModel = structuredClone(this.user);
    this.password = null;
    this.confirmPassword = null;
  }

  async logout() {
    let res = await this.appService.logout();

    if (res) {
      this.router.navigate(['/']);
    }
  }

  async saveSettings() {

    if(!this.userModel || !this.user) return;

    if(!this.settingsForm.valid){
      return;
    }

    if(this.password && this.password != this.confirmPassword){
      this.settingsForm.form.get("confirmPassword")?.setErrors({"notSame" : "Пароли не совпадают"});
      return;
    }

    this.saving = true;
    try {
      await this.appService.SaveSettings({
        Email: this.userModel.Email ?? "",
        Password: this.password || null,
        ConfirmPassword: this.confirmPassword || null
      });
    } catch (err) {

    }
    this.saving = false;

    showSuccessAlert("Изменения сохранены")
  }
}

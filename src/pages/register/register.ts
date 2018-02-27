import { Component, OnInit } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import { LoginService } from '../../services/login-service';
import { TabsPage } from '../../pages/tabs/tabs';
import { NavController, AlertController, LoadingController, Loading, IonicPage } from 'ionic-angular';

@Component({
  selector: 'page-register',
  templateUrl: 'register.html'
})
export class RegisterPage {
createSuccess = false;
  registerCredentials = { username: '', phone: '', password: '' };
 
  constructor(private nav: NavController, private loginService: LoginService, private alertCtrl: AlertController) { 
  
  }
 
  public register() {
    this.loginService.register(this.registerCredentials).then(success => {
      if (success) {
        this.createSuccess = true;
        this.showPopup("Success", "Account created.");
      } else {
        this.showPopup("Error", "Problem creating account.");
      }
    },
      error => {
        this.showPopup("Error", error);
      });
  }
 
  showPopup(title, text) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: text,
      buttons: [
        {
          text: 'OK',
          handler: data => {
            if (this.createSuccess) {
              this.nav.popToRoot();
            }
          }
        }
      ]
    });
    alert.present();
  }
}
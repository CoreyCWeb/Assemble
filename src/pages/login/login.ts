import { Component, OnInit } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import { LoginService } from '../../services/login-service';
import { TabsPage } from '../../pages/tabs/tabs';
import { RegisterPage } from '../../pages/register/register';
import { NavController, AlertController, LoadingController, Loading, IonicPage } from 'ionic-angular';
import { AppService } from '../../services/app-service';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  constructor(public loginService: LoginService, private nav: NavController, public appService: AppService) { }

  loading: Loading;
  registerCredentials = { username: '', password: '' };
 
  public createAccount() {
    this.nav.push(RegisterPage);
  }
 
  public login(){
    this.appService.showLoading();
    let this_ = this;
    this.loginService.authenticate(this.registerCredentials.username, this.registerCredentials.password).then((success: any)=> {

        this.nav.setRoot(TabsPage);
    }).catch(function(err){
       this_.appService.showError(err);
    });
  }

  ngOnInit() {
  }

  
}
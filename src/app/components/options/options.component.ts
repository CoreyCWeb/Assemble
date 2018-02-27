import { Component, OnInit, Input } from '@angular/core';
import { LoginService } from '../../../services/login-service';
import { PopoverController, ViewController, NavController} from 'ionic-angular';
import { LoginPage } from '../../../pages/login/login';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html'
})
export class OptionsComponent implements OnInit {

  @Input() title: String;

  constructor(public popoverCtrl: PopoverController) {
    
  }

  ngOnInit() {
        console.log(this.title);
  }

  presentPopover(myEvent) {
    console.log("popover");
    let popover = this.popoverCtrl.create(MyPopOverPage);
    popover.present({ev: myEvent});
  }

  
}

@Component({
  template: `<ion-list radio-group class="popover-page">
   <ion-row>
        <ion-col>
     <button ion-button color="light" icon-left clear (click)=logout();>
        <ion-icon name="log-out"></ion-icon>
        <div>Logout</div>
    </button>
    </ion-col>
    </ion-row>
</ion-list>`
})

export class MyPopOverPage {

  constructor(public loginService: LoginService, public viewCtrl: ViewController, public navCtrl: NavController) {
    
  }

  logout(){
    this.viewCtrl.dismiss();
    this.loginService.logout();
    this.navCtrl.setRoot(LoginPage);
  }
 
}
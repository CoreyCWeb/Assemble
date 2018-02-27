import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { UserService } from '../../services/user-service'; 
import { GroupService } from '../../services/group-service';
import { ModalController } from 'ionic-angular';

@Component({
  selector: 'createGroup',
  templateUrl: 'createGroup.html'
})
export class CreateGroupModal { 
  name: any;
  group: any;
 
  constructor(public viewCtrl: ViewController, public groupService: GroupService, public userService: UserService, public modalCtrl: ModalController) {
 
  }
 
  create(): void {
 
    let group = {
      name: this.name,
      admin: this.userService.currentUser._id
    };
 
    this.viewCtrl.dismiss(group);
 
  }


 
  close(): void {
    this.viewCtrl.dismiss();
  }
}

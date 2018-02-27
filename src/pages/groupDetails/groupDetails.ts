import { Component } from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import { GroupService } from '../../services/group-service';
import { UserService } from '../../services/user-service';
import { AppService } from '../../services/app-service';
import { ModalController } from 'ionic-angular';
import { CreateGroupModal } from '../../pages/createGroup/createGroup';
import { ActionSheetController } from 'ionic-angular';
import { JoinGroupModal } from '../../pages/joinGroup/joinGroup';
import { Clipboard } from '@ionic-native/clipboard';
import { ToastController } from 'ionic-angular';
import { Events } from 'ionic-angular';

@Component({
  selector: 'page-groupDetails',
  templateUrl: 'groupDetails.html'
})
export class GroupDetailsPage {

  group: any;
  admin: any;
  members: any;
  isAdmin: boolean;

  constructor(public navCtrl: NavController,public events: Events, private navParams: NavParams,public toastCtrl: ToastController, public appService: AppService, public groupService: GroupService, public userService: UserService, public modalCtrl: ModalController, public actionSheetCtrl: ActionSheetController, private clipboard: Clipboard) {
    this.group = navParams.get('group'); 
    
    if(this.userService.currentUser._id == this.group.admin){
      this.isAdmin = true;
    }else
      this.isAdmin = false;

    this.setGroupMembers();
    this.setAdminUser();
  }

  setAdminUser(){
    this.userService.getUserById(this.group.admin).then((data:any)=>{
      this.admin = data.username;
    })
  }

  deleteGroup(){
    this.groupService.deleteGroup(this.group._id).then((data:any)=>{
      console.log(data);
      this.appService.showToast(this.group.name + " Group Deleted");
      this.events.publish('delete:group', this.group);
      this.navCtrl.pop();
    }).catch(err =>{
      this.appService.showToast("You are not the admin");
    });
  }

  copy(){
    this.clipboard.copy(this.group.code);

    let toast = this.toastCtrl.create({
      message: 'Copied to clipboard',
      duration: 3000
    });
    toast.present();
  }

  private setGroupMembers(){
    this.members = [];
    this.groupService.getUsersInGroup(this.group._id).then((data) =>{
        this.members = data;
    });
  }
}

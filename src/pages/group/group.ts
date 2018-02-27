import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { GroupService } from '../../services/group-service';
import { ModalController } from 'ionic-angular';
import { CreateGroupModal } from '../../pages/createGroup/createGroup';
import { GroupDetailsPage } from '../../pages/groupDetails/groupDetails';
import { ActionSheetController } from 'ionic-angular';
import { JoinGroupModal } from '../../pages/joinGroup/joinGroup';
import { Events } from 'ionic-angular';

@Component({
  selector: 'page-group',
  templateUrl: 'group.html'
})
export class GroupPage {

  groups: any;
  members: any;

  constructor(public navCtrl: NavController, public events: Events, public groupService: GroupService, public modalCtrl: ModalController, public actionSheetCtrl: ActionSheetController) {
    this.groups = [];
    
    this.groupService.getUsersGroups().then((data) =>{
        this.groups = data;
        if(this.groups[0] == null){
          this.groups = [];
        }
        this.setGroupMembers(this.groups);
    }).catch(function(err){
        console.log(err);
    });

    this.events.subscribe('delete:group', (group) => {
      this.groups.pop(group);
    });
  }

  presentActionSheet() {
   let actionSheet = this.actionSheetCtrl.create({
     title: 'Group Options',
     buttons: [
       {
         text: 'Create',
         icon: 'add',
         handler: () => {
           this.createGroupModal();
         }
       },
       {
         text: 'Join',
         icon: 'people',
         handler: () => {
           this.joinGroupModal();
         }
       },
       {
         text: 'Cancel',
         icon: 'close',
         role: 'cancel',
         handler: () => {
         }
       }
     ]
   });

   actionSheet.present();
  }

  createGroupModal(){
    let modal = this.modalCtrl.create(CreateGroupModal);

    modal.onDidDismiss(group => {
      if (group) {
        this.groupService.createGroup(group).then((data) => {
          this.events.publish('new:group', data);
          this.groups.push(data);
          this.setGroupMembers([data]);
          this.viewGroup(data);
        });
      }
    });

    modal.present();
  }

  joinGroupModal(){
    let modal = this.modalCtrl.create(JoinGroupModal);

    modal.onDidDismiss(code => {
      if (code) {
        this.groupService.joinGroup(code).then((data) => {
          this.groups.push(data);
          this.setGroupMembers([data]);
        });
      }
    });

    modal.present();
  }

  viewGroup(groupP){
    this.navCtrl.push(GroupDetailsPage, {
      group: groupP
    });
  }

  private setGroupMembers(groupsP){
    for(let group of groupsP){
      group.members = [];
      this.groupService.getUsersInGroup(group._id).then((data) =>{
          group.members = data;
      });
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { GroupService } from '../../../services/group-service';
import { InviteService } from '../../../services/invite-service';
import { AppService } from '../../../services/app-service';
import { ToastController } from 'ionic-angular';
import { GroupPage } from '../../../pages/group/group';
import { Events, NavController } from 'ionic-angular';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html'
})
export class InviteComponent implements OnInit {

  groups: any;
  invite: any;
  hasGroup: boolean;
  selectedGroup: any;

  constructor(public groupService: GroupService, public events: Events, public inviteService: InviteService, public appService: AppService, public navCtrl: NavController) {
   
  }

  ngOnInit() {
      this.groups = [];
      //Listen for added groups
      this.events.subscribe('new:group', (group) => {
        this.groups.push(group);
        this.hasGroup = true;
        this.selectedGroup = this.groups[0]._id;
      });

      this.events.subscribe('delete:group', (group) => {
        this.groups.pop(group);
        if(this.groups.length >= 1 && this.groups[0] != null){
          this.selectedGroup = this.groups[0]._id;
          this.hasGroup = true;
        }else{
          this.hasGroup = false;
        }
      });

      this.updateGroups();   
  }

  updateGroups(){
    this.groupService.getUsersGroups().then((data: any) => {
      console.log(data);
      if(data[0] != null){
        this.groups = data;
        this.hasGroup = true;
        this.selectedGroup = this.groups[0]._id; 
      }else{
        this.groups = [];
        this.hasGroup = false;
      }
    });
  }

  goToGroup(){
    this.navCtrl.parent.select(1);
  }

  createInvite(){
      this.inviteService.createInvite(this.selectedGroup).then((data)=>{
        this.appService.showToast("Invite sent to group");
      })
  }

}
import { Component, OnInit, OnDestroy } from '@angular/core';
import {NavController} from 'ionic-angular';
import { GroupService } from '../../../services/group-service';
import { InvitePage } from '../../../pages/invite/invite';
import { InviteService } from '../../../services/invite-service';
import { AppService } from '../../../services/app-service';
import { UserService } from '../../../services/user-service';
import { LocalNotifications } from '@ionic-native/local-notifications';

@Component({
  selector: 'app-inviteFeed',
  templateUrl: './inviteFeed.component.html'
})
export class InviteFeedComponent implements OnInit, OnDestroy  {

  invites: any[];
  viewedInvites: any;
  connection:any;

  constructor(public groupService: GroupService, public appService: AppService, public inviteService: InviteService,public userService: UserService, private localNotifications: LocalNotifications, public navController: NavController) {
    this.invites = [];
     //listen for adds to queue
    this.connection = this.groupService.invite().subscribe(invite => {
      this.notify();
      this.setInvitesInfo([invite]);
    });

    this.inviteService.getAllInvites().then((data:any)=>{
      this.setInvitesInfo(data);
    });

    this.viewedInvites = [];
    this.appService.getItem("viewed").then((data)=>{
      if(data){
        this.viewedInvites = data;
      }
    })
    
  }

  ngOnInit() {
  }

  notify(){
    this.localNotifications.schedule({
      id: 1,
      text: 'Single ILocalNotification'
    });

  }

  setInvitesInfo(invitesP){
    let i = 0;
    for(let invite of invitesP){
      this.getInviteInfo(invite).then((data)=>{
        i++;       
        this.invites.unshift(data);
        if(i >= this.invites.length)
          this.sortArrayByDate();
      });
    }
      
  }

  getInviteInfo(inviteP){
    return new Promise((resolve, reject) => {
      this.inviteService.getInviteInfo(inviteP).then((data)=>{
        resolve(data);
      })
    });
  }

  sortArrayByDate(){
    this.invites.sort(function(a,b){
      var c:any = new Date(a.date);
      var d:any= new Date(b.date);
      return d-c;
    });
  }

  viewInvite(inviteP){

    if(this.viewedInvites.indexOf(inviteP._id) == -1){
      this.viewedInvites.push(inviteP._id);
      this.appService.setItem("viewed", this.viewedInvites);
    }

    this.invites[this.invites.indexOf(inviteP)].viewed = true;
     
    this.navController.push(InvitePage, {
      invite: inviteP
    });
  }


  delete(i){
    this.invites.splice(this.invites.indexOf(i),1);

    this.inviteService.delete(i._id);
  }

  ngOnDestroy() { 
      this.invites = [];
   }
 
}
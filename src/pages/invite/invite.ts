import { Component, OnInit } from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import { GroupService } from '../../services/group-service';
import { InviteService } from '../../services/invite-service';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'page-invite',
  templateUrl: 'invite.html'
})
export class InvitePage {

  invite: any;
  isGoing: Boolean;

  constructor(private navController: NavController, private navParams: NavParams, public groupService: GroupService, public inviteService: InviteService, public userService: UserService) { 
    this.invite = navParams.get('invite'); 
  }

  ngOnInit() {
    if(this.invite.going.map(function(x) {return x._id; }).indexOf(this.userService.currentUser._id) != -1)
      this.isGoing = true;
    else
      this.isGoing = false;
  }

  doRefresh(refresher){
    this.inviteService.getInvite(this.invite._id).then((data)=>{
      this.inviteService.getInviteInfo(data).then((data)=>{
          this.invite = data;
          refresher.complete();
      });
    });
  }
  
  going(){
    this.isGoing = true;
    this.inviteService.userGoing(this.invite._id);
    this.invite.going.push(this.userService.currentUser);
  }
}

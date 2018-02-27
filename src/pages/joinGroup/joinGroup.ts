import { Component } from '@angular/core';
import { ViewController, AlertController, LoadingController } from 'ionic-angular';
import { UserService } from '../../services/user-service'; 
import { GroupService } from '../../services/group-service'; 
import { AppService } from '../../services/app-service';
@Component({
  selector: 'joinGroup',
  templateUrl: 'joinGroup.html'
})
export class JoinGroupModal { 
  code: String;

  constructor(public viewCtrl: ViewController, public userService: UserService, public groupService: GroupService,public appService: AppService ) {
 
  }
 
  join(): void { 
    this.appService.showLoading();
    this.groupService.getGroupByCode(this.code).then((data:any)=>{
      console.log(data);
      console.log(this.groupService.groups);
      if(data){
        if(this.groupService.groups.find(x=>x._id = data._id)){
           this.appService.showError("You are already in this group");
        }else{
          this.appService.stopLoading();
          this.viewCtrl.dismiss(this.code);
        }
        
      }else{
        this.appService.showError("Group not found");
      }
      
    }).catch((err)=>{
      this.appService.showError(err);
    })
    
  }
 
  close(): void {
    this.viewCtrl.dismiss();
  }
}

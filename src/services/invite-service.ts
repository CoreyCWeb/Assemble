import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { GroupService } from './group-service';
import { AppService } from './app-service';
import { UserService } from './user-service';

import 'rxjs/add/operator/map';

@Injectable()
export class InviteService {

  invites:any;

  constructor(public http: Http, public groupService: GroupService, public userService: UserService, public appService: AppService) {
    this.invites = [];
  }

  createInvite(groupIdP){
    return new Promise((resolve, reject) => {
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      
      this.http.post('http://localhost:8080/api/invite', JSON.stringify({group: groupIdP, user: this.userService.currentUser._id, token:  this.userService.token }), { headers: headers })
        .map(res => res.json())
        .subscribe(invite => {
          this.groupService.sendInvite(invite).then((data) => {
            this.sendInviteTexts(groupIdP).then((data)=>{
                resolve("success");
            }).catch((error)=>{
              //Ignore Twilio Error
               resolve("success");
            });
          });;    
        },
        err => {
          reject(err);
        });
    
      
    });
  }

  sendInviteTexts(groupIdP){
    return new Promise((resolve, reject) => {
      this.groupService.getUsersInGroup(groupIdP).then((data:any)=>{

          this.groupService.getGroupById(groupIdP).then((group:any)=>{
            let groupName = group.name;

            let count = 0;
            for(let user of data){ 
              let headers = new Headers();
              headers.append('Content-Type', 'application/json');
              
              this.http.post('http://localhost:8080/api/text', JSON.stringify({group: groupName, phone: user.phone }), { headers: headers })
                .map(res => res.json())
                .subscribe(success => {
                    count++;
                    if(count == data.length){
                      resolve(success);
                    }
                },
                err => {
                  reject(err);
                });
            }
          });
         
      });
    });
  }

  getInviteInfo(inviteP){
    return new Promise((resolve, reject) => {
      let invite:any;
      invite ={};
      invite._id = inviteP._id;
      this.groupService.getGroupById(inviteP.group).then((data)=>{
        invite.group = data;
        this.userService.getUserById(inviteP.user).then((data)=>{
          invite.user = data;
          invite.date = inviteP.date;
          this.setViewed(inviteP).then((data)=>{
              invite.viewed = data;

              this.getUsersGoing(inviteP.going).then((data) =>{
                invite.going = data;
                resolve(invite);
              });
          });
         
        });
      })
    });
  }

  setViewed(inviteP){
    return new Promise((resolve, reject) => {
      this.appService.getItem("viewed").then((data)=>{
        let viewed = data;
        if(viewed){
          if(viewed.indexOf(inviteP._id) != -1){
            resolve(true);
          }else{
             resolve(false);
          }
        }else{
          resolve(false);
        }
      });
    });
   
  }

  userGoing(inviteIdP){
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
    
        this.http.post('http://localhost:8080/api/invite/going', JSON.stringify({inviteId: inviteIdP, userId: this.userService.currentUser._id, token:  this.userService.token }), { headers: headers })
          .map(res => res.json())
          .subscribe(invite => {
            console.log(invite);
          },
          err => {
            console.log(err);
          });
  }

  getUsersGoing(going){
    let users:any = [];

    return new Promise((resolve, reject) => {
      let i = 0;
      if(going.length == 0)
        resolve(users);
      
      for(let member of going){
          //get users groups
        // add authorization header with jwt token
        let headers = new Headers({ 'x-access-token': this.userService.token });
        let options = new RequestOptions({ headers: headers });

        
        // get users from api
        this.http.get('http://localhost:8080/api/user/'+ member, options)
          .map(res => res.json())
          .subscribe(data => {
              i++;
              users.push(data);
              if(i >= going.length)
                resolve(users);
          },
          err => {
            reject(users);
          });
        }
    });
  }

  getAllInvites(){
    return new Promise((resolve, reject) => {
      this.groupService.getUsersGroups().then((groups:any) =>{
        if(groups[0] != null){
          let i=0;
          for(let group of groups){
            this.getInvitesOfGroup(group.invites).then((data)=>{
                i++;
                if(i >= groups.length){
                  
                  resolve(this.invites);
                }
            });
          }
        }else{
          resolve([]);
        }

      })
    });
  }

  getInvitesOfGroup(invitesP){
    this.invites = [];
    return new Promise((resolve, reject) => {
      let i =0;
      if(invitesP.length != 0){
        for(let invite of invitesP){
          
          this.getInvite(invite).then((data)=>{
              this.invites.push(data);
              i++;
    
              if(i >= invitesP.length){
                
                resolve(this.invites);
              }
          });
        }
      }else{
        resolve([]);
      }
     
    });
  }

  getInvite(idP){
     //get users groups
     // add authorization header with jwt token
    let headers = new Headers({ 'x-access-token': this.userService.token });
    let options = new RequestOptions({ headers: headers });

    
    // get invite
    return new Promise((resolve, reject) => {
      this.http.get('http://localhost:8080/api/invite/'+idP, options)
        .map(res => res.json())
        .subscribe(data => {
            resolve(data);
        },
        err => {
          reject(err);
        });
    });
  }

  delete(inviteIdP){
     let headers = new Headers({ 'x-access-token': this.userService.token });
    let options = new RequestOptions({ headers: headers });

    
    // get invite
    return new Promise((resolve, reject) => {
      this.http.delete('http://localhost:8080/api/invite/'+inviteIdP, options)
        .map(res => res.json())
        .subscribe(data => {
            resolve(data);
        },
        err => {
          reject(err);
        });
    });
  }


  
}
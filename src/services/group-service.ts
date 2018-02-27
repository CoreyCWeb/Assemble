import { Injectable } from '@angular/core';
import { Http, Headers,RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { UserService } from './user-service';
import * as io from 'socket.io-client';
import 'rxjs/add/operator/map';

@Injectable()
export class GroupService {

  public groups: any[];
  private url = 'http://localhost:5000';
  private socket;

  constructor(public http: Http, public userService: UserService) {
    this.socket = io(this.url);
  }

  createGroup(groupP){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers });
    
    return new Promise((resolve, reject) => {
      this.http.post('http://localhost:8080/api/group', JSON.stringify({name: groupP.name, admin: groupP.admin, token:  this.userService.token }), { headers: headers })
        .map(res => res.json())
        .subscribe(data => {         
          resolve(data);
        },
        err => {
          reject(err);
        });
    });
  }

  joinGroup(codeP){
    //todo add group to users groups
    return new Promise((resolve, reject) => {
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      let options = new RequestOptions({ headers: headers });
      
      this.getGroupByCode(codeP).then((data:any) =>{
          this.http.post('http://localhost:8080/api/user/join', JSON.stringify({groupId: data._id, userId: this.userService.currentUser._id, token:  this.userService.token }), { headers: headers })
          .map(res => res.json())
          .subscribe(data => { 
            this.socket.emit('join', data._id);        
            resolve(data);
          },
          err => {
            reject(err);
          });
      });
    });
  }

  joinGroupSockets(){
    //get users groups
    let groups = this.getUsersGroupIds();

    if(groups){
      for(let group of groups){
         this.socket.emit('join', group);
      }
    }
  }

  getGroupById(idP){
    //get users groups
    // add authorization header with jwt token
    let headers = new Headers({ 'x-access-token': this.userService.token });
    let options = new RequestOptions({ headers: headers });

    
    // get users from api
    return new Promise((resolve, reject) => {
      this.http.get('http://localhost:8080/api/group/'+ idP, options)
        .map(res => res.json())
        .subscribe(data => {
            resolve(data);
        },
        err => {
          reject(err);
        });
    });
  }

  
  getGroupByCode(codeP){
    //get users groups
    // add authorization header with jwt token
    let headers = new Headers({ 'x-access-token': this.userService.token });
    let options = new RequestOptions({ headers: headers });
    
    // get users from api
    return new Promise((resolve, reject) => {
      this.http.get('http://localhost:8080/api/group/code/'+ codeP, options)
        .map(res => res.json())
        .subscribe(data => {
            resolve(data);
        },
        err => {
          reject(err);
        });
    });
  }


  getUsersGroupIds(){
    let groups = this.userService.getCurrentUser().groups;
    if(groups)
      return groups;
    else
      return null;
  }

  getUsersGroups(){
    //get users groups
     // add authorization header with jwt token
    let headers = new Headers({ 'x-access-token': this.userService.token });
    let options = new RequestOptions({ headers: headers });

    
    // get users from api
    return new Promise((resolve, reject) => {
      this.http.get('http://localhost:8080/api/user/'+this.userService.currentUser._id+'/groups', options)
        .map(res => res.json())
        .subscribe(data => {
            this.groups = data;
            resolve(data);
        },
        err => {
          reject(err);
        });
    });
  }

  getUsersInGroup(groupIdP){
    //get users groups
     // add authorization header with jwt token
    let headers = new Headers({ 'x-access-token': this.userService.token });
    let options = new RequestOptions({ headers: headers });

    
    // get users from api
    return new Promise((resolve, reject) => {
      this.http.get('http://localhost:8080/api/users/group/'+ groupIdP, options)
        .map(res => res.json())
        .subscribe(data => {
            resolve(data);
        },
        err => {
          reject(err);
        });
    });
  }

  invite() {
    return this.listenForSocketEvent("invite");
  }

  sendInvite(invite){
    this.emitToGroup('sendInvite', invite);

    let headers = new Headers({ 'x-access-token': this.userService.token });
    let options = new RequestOptions({ headers: headers });

    return new Promise((resolve, reject) => {
      this.http.get('http://localhost:8080/api/group/'+ invite.group +'/invite/'+ invite._id, options)
        .map(res => res.json())
        .subscribe(data => {
            resolve(data);
        },
        err => {
          reject(err);
        });
    });
  }

  deleteGroup(groupIdP){
    let headers = new Headers({ 'x-access-token': this.userService.token });
    let options = new RequestOptions({ headers: headers });

    return new Promise((resolve, reject) => {
      this.http.delete('http://localhost:8080/api/group/'+ groupIdP, options)
        .map(res => res.json())
        .subscribe(data => {
            resolve(data);
        },
        err => {
          reject(err);
        });
    });
  }

  emitToGroup(event, data) {
    this.socket.emit(event, data, data.group);
  }

  listenForSocketEvent(event){
    let observable = new Observable<any>(observer => {
      this.socket.on(event, function (data) {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }
  
}
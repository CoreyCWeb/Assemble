import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { UserService } from './user-service';
import { AppService } from './app-service';
import { GroupService } from './group-service';
import 'rxjs/add/operator/map';

@Injectable()
export class LoginService {

  constructor(public http: Http, public userService: UserService, public appService: AppService,public groupService: GroupService) { }

  currentUser: any;

  isLoggedIn(){
      if(this.appService.getItem("currentUser")){
          return true;
      }else{
          return false;
      }
  }

  getUser(){
      return this.currentUser;
  }

  register(credentials) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return new Promise((resolve, reject) => {
        this.http.post('http://localhost:8080/api/user', JSON.stringify({username: credentials.username, phone: credentials.phone, password: credentials.password}), { headers: headers })
        .map(res => res.json())
        .subscribe(data => {
            resolve(data);
        },
        err => {
          reject(this.extractErrorMessage(err));
        });
    });
  }

  authenticate(usernameP, passwordP){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return new Promise((resolve, reject) => {
      this.http.post('http://localhost:8080/api/authenticate', JSON.stringify({username: usernameP, password: passwordP}), { headers: headers })
        .map(res => res.json())
        .subscribe(data => {
          
          // login successful if there's a jwt token in the response
          if (data.token && data.user) {
              // store user details and jwt token in local storage to keep user logged in between page refreshes
              this.appService.setItem('token', JSON.stringify(data.token));
              this.appService.setItem('currentUser', JSON.stringify(data.user));

              //set User in user service
              this.userService.setCurrentUser(data.user);
              this.userService.setToken(data.token);
              //join sockets
              this.groupService.joinGroupSockets();

              resolve(data);
          }
        },
        err => {
          reject(this.extractErrorMessage(err));
        });
    });
  }

  logout(){
    this.appService.setItem('token', null);
    this.appService.setItem('currentUser', null);
  }

  extractErrorMessage(error){
    var err = JSON.parse(error._body);
    return err.error;
  }
}
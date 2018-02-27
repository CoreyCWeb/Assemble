import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class UserService {

  currentUser:any;
  public token: string;
  constructor(public http: Http) {
    
  }
  
  setCurrentUser(user){
    this.currentUser = user;
  }

  getCurrentUser(){
    return this.currentUser;
  }

  setAvatar(){

  }

  getUserById(idP){
    //get users groups
     // add authorization header with jwt token
    let headers = new Headers({ 'x-access-token': this.token });
    let options = new RequestOptions({ headers: headers });

    
    // get users from api
    return new Promise((resolve, reject) => {
      this.http.get('http://localhost:8080/api/user/'+ idP, options)
        .map(res => res.json())
        .subscribe(data => {
            resolve(data);
        },
        err => {
          reject(err);
        });
    });
  }

  setToken(token){
    this.token = token;
  }
}
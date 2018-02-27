import { Injectable } from '@angular/core';
import { AlertController, LoadingController, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@Injectable()
export class AppService {

  loading:any;

  constructor(private alertCtrl: AlertController, private loadingCtrl: LoadingController, private toastCtrl: ToastController, private storage: Storage) {
    
  }

  showLoading() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...',
      dismissOnPageChange: true
    });
    this.loading.present();
  }
 
  stopLoading(){
    this.loading.dismiss();
  }
  
  showError(text) {
    this.loading.dismiss();
 
    let alert = this.alertCtrl.create({
      title: 'Error',
      subTitle: text,
      buttons: ['OK']
    });
    alert.present(prompt);
  }

  showToast(text){
    let toast = this.toastCtrl.create({
          message: text,
          duration: 3000
        });
        toast.present();
  }

  setItem(name, object){
     // set a key/value
    this.storage.set(name, object);

  }

  getItem(name): any{
    return new Promise((resolve, reject) => {
      this.storage.get(name).then((val) => {
        resolve(val);
      }).catch((err)=>{
        resolve([]);
      });
    });
  }


 
  
}
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-refresh',
  templateUrl: './refresh.component.html'
})
export class RefreshComponent {

  @Output() refresh = new EventEmitter();
  constructor() {
    
  }

  doRefresh(refresher){
    this.refresh.emit(refresher);
  }

}
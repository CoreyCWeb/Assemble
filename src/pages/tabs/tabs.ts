import { Component } from '@angular/core';
import { GroupPage } from '../group/group';
import { HomePage } from '../home/home';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = GroupPage;

  constructor() {

  }
}

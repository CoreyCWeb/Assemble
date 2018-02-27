import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule} from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HttpModule } from '@angular/http';

//Pages
import { GroupPage } from '../pages/group/group';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { RegisterPage } from '../pages/register/register';
import { InvitePage } from '../pages/invite/invite';
import { GroupDetailsPage } from '../pages/groupDetails/groupDetails';

//Components
import { InviteComponent } from '../app/components/invite/invite.component';
import { InviteFeedComponent } from '../app/components/inviteFeed/inviteFeed.component';
import { RefreshComponent } from '../app/components/refresh/refresh.component';
import { CreateGroupModal } from '../pages/createGroup/createGroup';
import { JoinGroupModal } from '../pages/joinGroup/joinGroup';
import { OptionsComponent } from '../app/components/options/options.component';
import { MyPopOverPage } from '../app/components/options/options.component';

//Native Pulgin
import { LocalNotifications } from "@ionic-native/local-notifications";
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TextAvatarDirective } from '../directives/text-avatar/text-avatar';
import { MomentModule } from 'angular2-moment';
import { Clipboard } from '@ionic-native/clipboard';
import { IonicStorageModule } from '@ionic/storage';

//Services
import { InviteService } from '../services/invite-service';
import { LoginService } from '../services/login-service';
import { UserService } from '../services/user-service';
import { GroupService } from '../services/group-service';
import { AppService } from '../services/app-service';
import { OrderByPipe } from '../app/components/pipes/orderby.pipe';


@NgModule({
  declarations: [
    MyApp,
    GroupPage,
    HomePage,
    TabsPage,
    LoginPage,
    RegisterPage,
    InvitePage,
    GroupDetailsPage,
    InviteComponent,
    OptionsComponent,
    MyPopOverPage,
    InviteFeedComponent,
    CreateGroupModal,
    JoinGroupModal,
    RefreshComponent,
    TextAvatarDirective,
    OrderByPipe
  ],
  imports: [
    BrowserModule,
    HttpModule,
    MomentModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    GroupPage,
    HomePage,
    TabsPage,
    LoginPage,
    RegisterPage,
    InvitePage,
    GroupDetailsPage,
    InviteComponent,
    OptionsComponent,
    MyPopOverPage,
    InviteFeedComponent,
    CreateGroupModal,
    JoinGroupModal,
    RefreshComponent
  ],
  providers: [
    StatusBar,
    SplashScreen,
    LoginService,
    InviteService,
    UserService,
    GroupService,
    AppService,
    LocalNotifications,
    Clipboard,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}

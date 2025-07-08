import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { PostsComponent } from './posts/posts.component';
import { TrendsComponent } from './trends/trends.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { ProfilesComponent } from './profiles/profiles.component';
import { CreatePostComponent } from './create-post/create-post.component';
import { PostListComponent } from './post-list/post-list.component';
import { HttpClientModule } from '@angular/common/http';
import { ShowPostComponent } from './show-post/show-post.component';
import { AdminComponent } from './admin/admin.component';
import { ViewUsersComponent } from './view-users/view-users.component';
import { NgChartsModule } from 'ng2-charts';
import { NavbarComponent } from './navbar/navbar.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { SocketComponent } from './web-socket/web-socket.component';
import { InboxComponent } from './inbox/inbox.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PostsComponent,
    TrendsComponent,
    AnalyticsComponent,
    ProfilesComponent,
    CreatePostComponent,
    PostListComponent,
    ShowPostComponent,
    AdminComponent,
    ViewUsersComponent,
    NavbarComponent,
    SocketComponent,
    InboxComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule, 
    HttpClientModule,
    FormsModule,
    NgChartsModule,    
    LeafletModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

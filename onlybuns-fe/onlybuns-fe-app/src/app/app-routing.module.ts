import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PostsComponent } from './posts/posts.component';
import { TrendsComponent } from './trends/trends.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { ProfilesComponent } from './profiles/profiles.component';
import { CreatePostComponent } from './create-post/create-post.component';
import { ShowPostComponent } from './show-post/show-post.component';
import { SocketComponent } from './web-socket/web-socket.component';
import { InboxComponent } from './inbox/inbox.component';
import { LoginComponent } from './login/login.component'; 
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'posts', component: PostsComponent },
  { path: 'trends', component: TrendsComponent },
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'profiles', component: ProfilesComponent },
  { path: 'create-post', component: CreatePostComponent },
  { path: 'show-posts', component: ShowPostComponent },
  { path: 'admin', component: HomeComponent},
  { path: 'socket', component: SocketComponent, pathMatch: 'full'},
  { path: 'inbox', component: InboxComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

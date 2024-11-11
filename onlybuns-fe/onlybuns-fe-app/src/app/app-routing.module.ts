import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PostsComponent } from './posts/posts.component';
import { TrendsComponent } from './trends/trends.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { ProfilesComponent } from './profiles/profiles.component';
import { CreatePostComponent } from './create-post/create-post.component';
import { FollowedPostsComponent } from './followed-posts/followed-posts.component';
import { NearbyPostMapComponent } from './nearby-post-map/nearby-post-map.component';
import { ChatComponent } from './chat/chat.component';
import { ProfileComponent } from './profile/profile.component';
import { UserTrendsComponent } from './user-trends/user-trends.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'posts', component: PostsComponent },
  { path: 'trends', component: TrendsComponent },
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'profiles', component: ProfilesComponent },
  { path: 'create-post', component: CreatePostComponent },
  { path: 'followed-post', component: FollowedPostsComponent },
  { path: 'nearby-post-map', component: NearbyPostMapComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'user-trends', component: UserTrendsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PostsComponent } from './posts/posts.component';
import { TrendsComponent } from './trends/trends.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { ProfilesComponent } from './profiles/profiles.component';
import { CreatePostComponent } from './create-post/create-post.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'posts', component: PostsComponent },
  { path: 'trends', component: TrendsComponent },
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'profiles', component: ProfilesComponent },
  { path: 'create-post', component: CreatePostComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

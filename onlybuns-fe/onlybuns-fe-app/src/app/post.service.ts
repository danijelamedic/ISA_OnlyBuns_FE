import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from './model/post.model';
import { Comment } from './model/comment.model';
import { User } from './model/user.model';
import { UpdatePostDto } from './model/update-post.dto.model';
import { Like } from './model/like.model';


@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://localhost:8080/posts';

  constructor(private http: HttpClient) {}

  createPost(postData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, postData);
  }

  showPost(): Observable<Post[]>{
    return this.http.get<Post[]>('http://localhost:8080/api/posts');
  } 

  getUsernameByPost(id: number): Observable<any>{
    return this.http.get<any>('http://localhost:8080/api/posts/getUsername/' + id);
  }
  
  getLikesNum(id: number): Observable<number>{
    return this.http.get<number>('http://localhost:8080/api/posts/getLikes/' + id);
  }

  getComments(id: number): Observable<Comment[]>{
    return this.http.get<Comment[]>('http://localhost:8080/api/posts/getComments/' + id);
  }

  getUsername(id: number): Observable<User>{
    return this.http.get<User>('http://localhost:8080/api/users/' + id);
  }

  getPostsByUser(id: number): Observable<Post[]>{
    return this.http.get<Post[]>('http://localhost:8080/api/posts/getByUser/' + id);
  }

  deletePost(id: number): Observable<void>{
    return this.http.delete<void>('http://localhost:8080/api/posts/' + id);
  }

  updatePost(updatePostDto: UpdatePostDto): Observable<any>{
    return this.http.put('http://localhost:8080/api/posts', updatePostDto);
  }

  likePost(postId: number, userId: number): Observable<Like>{
    console.log(`Pozivam POST zahtev za postId: ${postId}, userId: ${userId}`);
    return this.http.post<Like>('http://localhost:8080/api/like/' + postId + '/' + userId, null);
  }
}

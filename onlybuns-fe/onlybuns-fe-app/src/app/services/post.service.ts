import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../model/post.model';
import { Comment } from '../model/comment.model';
import { User } from '../model/user.model';
import { UpdatePostDto } from '../model/update-post.dto.model';
import { Like } from '../model/like.model';
import { PostDto } from '../model/post-dto.model';


@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://localhost:8080/api/posts';
  private currentUserId: number = 1;  // dodato polje

  constructor(private http: HttpClient) {}

  setUserId(userId: number): void {
    this.currentUserId = userId;
  }

  getUserId(): number {
    return this.currentUserId;
  }


  createPost(formData: FormData) {
  return this.http.post<PostDto>('http://localhost:8080/api/posts', formData);
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

  getComments(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`http://localhost:8080/api/comment/post/${postId}`);
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

  updatePost(updatePostDto: FormData): Observable<any>{
    return this.http.put('http://localhost:8080/api/posts', updatePostDto);
  }

  likePost(postId: number, userId: number): Observable<Like>{
    console.log(`Pozivam POST zahtev za postId: ${postId}, userId: ${userId}`);
    return this.http.post<Like>('http://localhost:8080/api/like/likePost/' + postId + '/' + userId, null);
  }

  getFollowingPosts(userId: number): Observable<Post[]>{
    return this.http.get<Post[]>('http://localhost:8080/api/posts/getFollowing/' + userId);
  }

  addComment(comment: { postId: number; userId: number; content: string }): Observable<any> {
  return this.http.post('http://localhost:8080/api/comment', comment);
}

  countLikes(id: number): Observable<number>{
    return this.http.get<number>(`http://localhost:8080/api/like/countLikes/` + id);
  }

}

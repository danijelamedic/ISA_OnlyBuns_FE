import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../model/user.model';
import { PaginatedResponse } from '../model/paged-user.model';
import { Follower } from '../model/follower.mode';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
private currentUserId: number = 1;   // dodato polje

  constructor(private http: HttpClient) { }

  setUserId(userId: number): void {
    this.currentUserId = userId;
  }

  getUserId(): number {
    return this.currentUserId;
  }

  getUsers(page: number, size: number): Observable<PaginatedResponse>{
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PaginatedResponse>('http://localhost:8080/api/admin/users', {params});
  }

  findByName(name: string): Observable<User[]> {
    return this.http.get<User[]>('http://localhost:8080/api/admin/findByName/' + name);
  }

  findBySurname(surname: string): Observable<User[]> {
    return this.http.get<User[]>(`http://localhost:8080/api/admin/findBySurname/` + surname);
  }

  findByEmail(email: string): Observable<User[]> {
    return this.http.get<User[]>(`http://localhost:8080/api/admin/findByEmail/` + email);
  }

  findByPostsNumber(min: number, max: number): Observable<User[]> {
    const params = new HttpParams().set('min', min).set('max', max);
    return this.http.get<User[]>(`http://localhost:8080/api/admin/findByPostsNumber`, { params });
  }

  sortByEmail(page: number, size: number): Observable<PaginatedResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PaginatedResponse>(`http://localhost:8080/api/admin/sortByEmail`, {params});
  }

  getTotalUsersCount(): Observable<number> {
    return this.http.get<number>('http://localhost:8080/api/admin/users/count');
  }

  getMyFollowers(userId: number): Observable<User[]>{
    return this.http.get<User[]>('http://localhost:8080/api/follower/getMyFollowers/' + userId);
  }

  getFollowingUsers(userId: number): Observable<User[]>{
    return this.http.get<User[]>('http://localhost:8080/api/follower/getFollowingUsers/' + userId);
  }

  follow(userId: number, followedUserId: number): Observable<Follower>{
    return this.http.post<Follower>('http://localhost:8080/api/follower/' + userId + '/' + followedUserId, null);
  } 

  unfollow(userId: number, followedUserId: number): Observable<Follower>{
    return this.http.delete<Follower>('http://localhost:8080/api/follower/' + userId + '/' + followedUserId);
  }

  getUserById(userId: number): Observable<User>{
    return this.http.get<User>('http://localhost:8080/api/users/' + userId);
  }

  getCommentsPerWeek(week: number, year: number): Observable<number> {
    return this.http.get<number>('http://localhost:8080/api/admin/getCommentsPerWeek/' + week + '/' + year);
  }

  getCommentsPerMonth(month: number, year: number): Observable<number> {
    return this.http.get<number>('http://localhost:8080/api/admin/getCommentsPerMonth/' + month + '/' + year);
  }

  getCommentsPerYear(year: number): Observable<number> {
    return this.http.get<number>('http://localhost:8080/api/admin/getCommentsPerYear/' + year);
  }

  getPostsPerWeek(week: number, year: number): Observable<number> {
    return this.http.get<number>('http://localhost:8080/api/admin/getPostsPerWeek/' + week + '/' + year);
  }

  getPostsPerMonth(month: number, year: number): Observable<number> {
    return this.http.get<number>('http://localhost:8080/api/admin/getPostsPerMonth/' + month + '/' + year);
  }

  getPostsPerYear(year: number): Observable<number> {
    return this.http.get<number>('http://localhost:8080/api/admin/getPostsPerYear/' + year);
  }

  getPostPercent(): Observable<number>{
    return this.http.get<number>('http://localhost:8080/api/admin/getPostPercent');
  }

  getCommentPercent(): Observable<number>{
    return this.http.get<number>('http://localhost:8080/api/admin/getCommentPercent');
  }

  getHaveNotAny(): Observable<number>{
    return this.http.get<number>('http://localhost:8080/api/admin/getHaveNotAny');
  }

  getAllUsers(): Observable<User[]>{
    return this.http.get<User[]>(`http://localhost:8080/api/users/getAll`);
  }

  getUserRoleById(userId: number): Observable<string> {
    return this.http.get(`http://localhost:8080/api/users/${userId}/role`, { responseType: 'text' });
  }
}

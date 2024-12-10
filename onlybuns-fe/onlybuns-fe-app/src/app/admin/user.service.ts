import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../model/user.model';
import { PaginatedResponse } from '../model/paged-user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

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

  findByEmail(email: string): Observable<User> {
    return this.http.get<User>(`http://localhost:8080/api/admin/findByEmail/` + email);
  }

  findByPostsNumber(min: number, max: number): Observable<User[]> {
    const params = new HttpParams().set('min', min).set('max', max);
    return this.http.get<User[]>(`http://localhost:8080/api/admin/findByPostsNumber`, { params });
  }

  sortByEmail(): Observable<User[]> {
    return this.http.get<User[]>(`http://localhost:8080/api/admin/sortByEmail`);
  }

  getTotalUsersCount(): Observable<number> {
    return this.http.get<number>('http://localhost:8080/api/admin/users/count');
  }
}

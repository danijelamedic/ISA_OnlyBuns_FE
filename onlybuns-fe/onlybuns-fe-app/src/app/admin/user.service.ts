import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../model/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]>{
    return this.http.get<User[]>('http://localhost:8080/api/admin/users');
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
}

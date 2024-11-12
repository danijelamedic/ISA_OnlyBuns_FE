import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api'; // Postavi odgovarajuću URL adresu

  constructor(private http: HttpClient) {}

// Prijava korisnika koja vraća token
login(username: string, password: string): Observable<boolean> {
  const loginData = { username, password };

  return this.http.post<{ token: string }>(`${this.apiUrl}/login`, loginData).pipe(
    tap(response => {
      // Čuva token u localStorage-u
      localStorage.setItem('authToken', response.token);
    }),
    map(() => true),  // Konvertuje izlaz u boolean vrednost true
    catchError(this.handleError<boolean>('login', false))
  );
}


  // Odjava korisnika
  logout(): void {
    // Opcionalno, poziva logout API ako backend zahteva
    localStorage.removeItem('authToken'); // Briše token iz localStorage-a
  }

  // // Provera da li je korisnik prijavljen
  // isLoggedIn(): boolean {
  //   return !!localStorage.getItem('authToken');
  // }

  isLoggedIn(): boolean {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    return false; // Nema tokena, korisnik nije prijavljen
  }
  
  // Dodatna logika za proveru isteka tokena (ako je potrebno)
  const isTokenValid = this.checkTokenExpiration(token);
  return isTokenValid;
}

private checkTokenExpiration(token: string): boolean {
  // Ovaj kod zavisi od strukture tokena, npr. JWT može imati datum isteka
  const decodedToken = this.decodeToken(token); // dekodira token
  const expirationDate = new Date(decodedToken.exp * 1000); // pretvara vreme isteka iz sekundi u milisekunde
  return new Date() < expirationDate; // proverava da li je trenutni datum manji od vremena isteka
}

private decodeToken(token: string): any {
  // Dekodira JWT token (možeš koristiti biblioteku poput `jwt-decode`)
  return JSON.parse(atob(token.split('.')[1]));
}

  // Pomoćna funkcija za rukovanje greškama
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}

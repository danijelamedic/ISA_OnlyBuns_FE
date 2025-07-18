import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
    userId: number = 1;  // pocetna vrednost
  constructor(
    private userService: UserService,
    private router: Router
  ) { }
  
    ngOnChanges() {
      this.userService.setUserId(this.userId);
    }

    updateUserId() {
      this.userService.setUserId(this.userId);
      console.log("Postavljen userId na:", this.userId);
    }

    onUserIdChange() {
      this.userService.setUserId(this.userId);
  }

     isLoggedIn(): boolean {
    // koristi 'isLoggedIn', ako tako setuješ u localStorage!
    return localStorage.getItem('isLoggedIn') === 'true';
  }
  logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userId'); // (i ostale podatke, ako imaš)
    window.location.href = '/login';   // ili this.router.navigate(['/login']);
  }

  username: string | null = null;

ngOnInit() {
  this.username = localStorage.getItem('username');
}


  
}
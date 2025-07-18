import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  userId: number = 1;  // Pocetna vrednost
  userRole: string | null = null;  // Dodano iz druge grane
  username: string | null = null;

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnChanges() {
    this.userService.setUserId(this.userId);
  }

  onUserIdChange(): void {
    if (this.userId != null) {
      console.log('Pozivam backend za userId=', this.userId);
      this.userService.getUserRoleById(this.userId).subscribe({
        next: (role) => {
          console.log("promena", role);
          this.userRole = role;
        },
        error: (err) => {
          console.error("Greška pri dohvatanju role:", err);
          this.userRole = null;
        }
      });
    } else {
      console.log("promena3");
      this.userRole = null;
    }
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    window.location.href = '/login';   // Možeš koristiti this.router.navigate(['/login']);
  }

  ngOnInit() {
    this.username = localStorage.getItem('username');
  }

}

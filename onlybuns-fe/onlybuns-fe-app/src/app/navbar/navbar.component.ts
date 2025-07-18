import { Component } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
    userId: number = 1;  // pocetna vrednost
    userRole: string | null = null;
    constructor(private userService: UserService) {}
    ngOnChanges() {
      this.userService.setUserId(this.userId);
    }

    updateUserId() {
      this.userService.setUserId(this.userId);
      console.log("Postavljen userId na:", this.userId);
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

}
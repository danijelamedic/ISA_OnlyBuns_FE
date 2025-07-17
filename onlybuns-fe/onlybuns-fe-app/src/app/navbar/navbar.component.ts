import { Component } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
    userId: number = 1;  // pocetna vrednost
    constructor(private userService: UserService) {}
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
}
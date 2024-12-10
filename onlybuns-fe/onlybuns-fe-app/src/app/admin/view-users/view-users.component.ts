import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/model/user.model';
import { UserService } from '../user.service';

@Component({
  selector: 'app-view-users',
  templateUrl: './view-users.component.html',
  styleUrls: ['./view-users.component.css']
})
export class ViewUsersComponent implements OnInit{
  users: User[] = [];
  totalUsers: number = 0;
  totalPages: number = 3;
  currentPage: number = 0;
  pageSize: number = 5;

  searchName: string = '';
  searchSurnameValue: string = '';
  searchEmail: string = '';
  minPosts: number = 0;
  maxPosts: number = 0;
  user: User = {
    id: 0,
    username: '',
    name: '',
    surname: '',
    email: '',
    postsNum: 0
  };

  constructor(private userService: UserService){}

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.userService.getUsers(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        console.log("response: ", response);
        if(Array.isArray(response)){
          this.users = response;
          console.log("users:", this.users);
        }
        else{
          console.error('Response does not contain valid users data');
        }
      },
      error: (err) => {
        console.error('Error fetching users', err);
      }
    });
  }

  searchByName(name: string): void {
    this.userService.findByName(name).subscribe({
      next: (data: User[]) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Error fetching users by name', err);
      }
    });
  }

  searchBySurname(surname: string): void {
    this.userService.findBySurname(surname).subscribe({
      next: (data: User[]) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Error fetching users by surname', err);
      }
    });
  }

  searchByEmail(email: string): void {
    if (email) {
      this.userService.findByEmail(email).subscribe({
        next: (data: User) => {
          this.user = data;
        },
        error: (err) => {
          console.error('Error searching users by email', err);
        }
      });
    } else {
      // Ako je pretraga prazna, učitajte sve korisnike
      this.getUsers();
    }
  }

  filterByPostsNumber(min: number, max: number): void {
    this.userService.findByPostsNumber(min, max).subscribe({
      next: (data: User[]) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Error fetching users by posts number', err);
      }
    });
  }

  sortByMail(): void {
    this.userService.sortByEmail().subscribe({
      next: (data: User[]) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Error sorting users by email', err);
      }
    });
  }

  resetFilters(): void {
    this.searchName = '';
    this.searchSurnameValue = '';
    this.searchEmail = '';
    this.minPosts = 0;
    this.maxPosts = 0;
    
    // Pozivanje loadUsers da se ponovo učitaju svi korisnici bez filtera
    this.getUsers();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.getUsers();
    }
  }
}

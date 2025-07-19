import { Component } from '@angular/core';
import { Role, User } from '../model/user.model';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  users: User[] = [];
  totalUsers: number = 0;
  totalPages: number | null = 0;
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
    postsNum: 0,
    role: Role.REGISTERED_USER,
    followerNum: 0
  };
  userId: number = Number(localStorage.getItem("userId"));

  isMailSortingOn = false;

  constructor(private userService: UserService){}

  ngOnInit(): void {
    this.getUser();
    this.getTotalUsersCount();
    this.getUsers();
  }

  getUser(): void{
    this.userService.getUserById(this.userId).subscribe({
      next: (response: User) => {
        this.user = response;
        console.log('user: ', this.user);
      },
      error: (err) => {
        console.error('Error fetching user', err);
      }
    })
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
        next: (response) => {
          this.users = response;
        },
        error: (err) => {
          console.error('Error searching users by email', err);
        }
      });
    } else {
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
    this.userService.sortByEmail(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
          console.log("response: ", response);
        if(Array.isArray(response)){
          this.users = response;
          console.log("users sorted by mail:", this.users);
        }
        else{
          console.error('Response does not contain valid users data');
        }
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
    
    this.getUsers();
  }

  getTotalUsersCount(): void {
    this.userService.getTotalUsersCount().subscribe({
      next: (data: number) => {
        this.totalPages = Math.ceil(data / this.pageSize);
        console.log('Total pages:', this.totalPages);
      },
      error: (err) => {
        console.error('Error getting total pages', err);
      }
    });
  }

  goToPage(page: number): void {
    console.log("Go to page pozvan sa stranica:", page);
    if(this.totalPages){
      if (page >= 0 && page < this.totalPages) {
        this.currentPage = page;
        if(this.isMailSortingOn){
          this.sortByMail();
        }
        else{
          this.getUsers();
        }
      } else {
        console.error("Page is out of range");
      }
    }
  }

  sortMail(){
    this.isMailSortingOn = !this.isMailSortingOn;
    this.sortByMail();
  }
}

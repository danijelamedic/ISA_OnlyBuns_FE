import { Component } from '@angular/core';
import { UserService } from '../admin/user.service';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent {
  // Comment Analytics
  week: string | undefined;
  month: string | undefined;
  year: number | undefined;
  result: number | undefined;

  // Post Analytics
  postWeek: string | undefined;
  postMonth: string | undefined;
  postYear: number | undefined;
  postResult: number | undefined;

  // Comment Mode and Post Mode
  mode: string | undefined;
  postMode: string | undefined;

  constructor(private service: UserService){}

  // Set modes for comment and post
  setCommentMode(mode: string): void {
    this.mode = mode;
  }

  setPostMode(mode: string): void {
    this.postMode = mode;
  }

  fetchCommentData(): void {
    switch (this.mode) {
      case 'week':
        if (this.week) {
          const [year, week] = this.week.split('-W').map(Number); // parsira godinu i nedelju
          if (year && week) {
            this.getCommentsPerWeek(week, year);
          }
        }
        else {
          alert('Please enter valid week.');
        }
      break;

      case 'month':
        if (this.month) {
          const [year, month] = this.month.split('-').map(Number); 
          if (year && month) {
            this.getCommentsPerMonth(month, year);
          }
        }
        else {
          alert('Please enter valid month.');
        }
      break;

      case 'year':
        if (this.year) {
          this.getCommentsPerYear(this.year);
        }
        else {
          alert('Please enter valid year.');
        }
      break;

      default:
        alert('Please select a mode (week, month, or year).');
    }
  }

  fetchPostData(): void {
    switch (this.postMode) {
      case'week':
        if (this.postWeek) {
          const [year, week] = this.postWeek.split('-W').map(Number); // parsira godinu i nedelju
          if (year && week) {
            this.getPostsPerWeek(week, year);
          }
        }
        else {
          alert('Please enter valid week.');
        }
      break;

      case 'month':
        if (this.postMonth) {
          const [year, month] = this.postMonth.split('-').map(Number); 
          if (year && month) {
            this.getPostsPerMonth(month, year);
          }
        }
        else {
          alert('Please enter valid month.');
        }
      break;

      case 'year':
        if (this.postYear) {
          this.getPostsPerYear(this.postYear);
        }
        else {
          alert('Please enter valid year.');
        }
      break;

      default:
        alert('Please select a mode (week, month, or year).');
    }
  }

  getCommentsPerWeek(week: number, year: number):void{
    this.service.getCommentsPerWeek(week, year).subscribe({
      next: (result: number) => {
        this.result = result;
      },
      error: (err) => {
        console.error('Error fetching comments per week', err);
      }
    })
  }

  getCommentsPerMonth(month: number, year: number):void{
    this.service.getCommentsPerMonth(month, year).subscribe({
      next: (result: number) => {
        this.result = result;
      },
      error: (err) => {
        console.error('Error fetching comments per month', err);
      }
    })
  }

  getCommentsPerYear(year: number):void{
    this.service.getCommentsPerYear(year).subscribe({
      next: (result: number) => {
        this.result = result;
      },
      error: (err) => {
        console.error('Error fetching comments per year', err);
      }
    })
  }

  getPostsPerWeek(week: number, year: number):void{
    this.service.getPostsPerWeek(week, year).subscribe({
      next: (result: number) => {
        this.postResult = result;
      },
      error: (err) => {
        console.error('Error fetching posts per week', err);
      }
    })
  }

  getPostsPerMonth(month: number, year: number):void{
    this.service.getPostsPerMonth(month, year).subscribe({
      next: (result: number) => {
        this.postResult = result;
      },
      error: (err) => {
        console.error('Error fetching posts per month', err);
      }
    })
  }

  getPostsPerYear(year: number):void{
    this.service.getPostsPerYear(year).subscribe({
      next: (result: number) => {
        this.postResult = result;
      },
      error: (err) => {
        console.error('Error fetching posts per year', err);
      }
    })
  }

}

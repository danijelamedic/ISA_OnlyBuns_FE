import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { ChartData, ChartOptions, ChartType } from 'chart.js';

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

  mode: string | undefined;
  postMode: string | undefined;

  postPercent: number | undefined;
  commentPercent: number | undefined;
  nothingPercent: number | undefined;

  public postChartData: ChartData<'doughnut', number[]> | undefined;
  public commentChartData: ChartData<'doughnut', number[]> | undefined;
  public nothingChartData: ChartData<'doughnut', number[]> | undefined;
  public chartType: ChartType = 'doughnut'; // Tip grafikona (npr. 'pie', 'doughnut', 'bar')
  public chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  constructor(private service: UserService){}

  ngOnInit():void{
    this.getPostPercent();
    this.getCommentPercent();
    this.getNothingPercent();
  }

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
          const [year, week] = this.postWeek.split('-W').map(Number);
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

  getPostPercent():void{
    this.service.getPostPercent().subscribe({
      next: (result: number) => {
        this.postPercent = result;
        this.updatePostChartData();

      },
      error: (err) => {
        console.error('Error fetching post percent', err);
      }
    })
  }

  getCommentPercent():void{
    this.service.getCommentPercent().subscribe({
      next: (result: number) => {
        this.commentPercent = result;
        this.updateCommentChartData();
      },
      error: (err) => {
        console.error('Error fetching comment percent', err);
      }
    })
  }

  getNothingPercent():void{
    this.service.getHaveNotAny().subscribe({
      next: (result: number) => {
        this.nothingPercent = result;
        this.updateNothingChartData();

      },
      error: (err) => {
        console.error('Error fetching nothing percent', err);
      }
    })
  }

  updatePostChartData(): void {
    this.postChartData = {
      datasets: [{
        data: [this.postPercent ?? 0, 100 - (this.postPercent ?? 0)],
        backgroundColor: ['#45a049', '#D3D3D3'],
      }]
    };
  }

  updateCommentChartData(): void {
    this.commentChartData = {
      datasets: [{
        data: [this.commentPercent ?? 0, 100 - (this.commentPercent ?? 0)],
        backgroundColor: ['#45a049', '#D3D3D3'],
      }]
    };
  }

  updateNothingChartData(): void {
    this.nothingChartData = {
      datasets: [{
        data: [this.nothingPercent ?? 0, 100 - (this.nothingPercent ?? 0)],
        backgroundColor: ['#45a049', '#D3D3D3'],
      }]
    };
  }

  // public chartLabels: string[] = ['Category A', 'Category B', 'Category C'];
  
}

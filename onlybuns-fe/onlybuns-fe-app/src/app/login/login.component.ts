import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
  if (this.loginForm.invalid) return;

  this.http.post<any>('http://localhost:8080/api/users/login', this.loginForm.value)
  .subscribe({
    next: (res) => {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', res.userId);
      localStorage.setItem('email', res.email);
      localStorage.setItem('username', res.username);
      this.router.navigate(['/']).then(() => {
          window.location.reload(); // reloaduj da bi Navbar pokupio username iz localStorage
        });
    },
    error: (err) => {
      this.errorMessage = err.error || 'Login failed. Check your credentials.';
    }
  });

}

}

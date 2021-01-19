import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AccountService } from '../../service/account.service';
import { AlertService } from '../../service/alert.service';
import { MustMatch } from '../../helpers/validator.service';


@Component({ templateUrl: 'register.component.html' })
export class RegisterComponent implements OnInit {
  form: FormGroup;
  loading = false;
  submitted = false;


  emailExist: boolean = null;
  usernameExist: boolean = null;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      displayName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password2: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', Validators.required],
      verificationCode: ['', Validators.required],
    }, {
        validator: MustMatch('password', 'password2')
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }

  checkEmail() {
    this.accountService.emailCheckIfExist(this.f.email.value)
      .pipe(first())
      .subscribe({
        next: (responds) => {
          this.loading = false;
          console.log(responds);
          this.emailExist = !responds.available;
        },
        error: error => {
          this.alertService.error(error);
          this.loading = false;
        }
      });
  }

  checkUserName() {
    this.accountService.userNameCheckIfExist(this.f.username.value)
      .pipe(first())
      .subscribe({
        next: (responds) => {
          this.loading = false;
          console.log(responds);
          this.usernameExist = !responds.available;
        },
        error: error => {
          this.alertService.error(error);
          this.loading = false;
        }
      });
  }

  onVerification() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid


    this.loading = true;
    //SEND VERIFICATION CODE

    this.accountService.emailVerification(this.f.email.value, this.f.username.value)
      .pipe(first())
      .subscribe({
        next: (responds) => {
          this.loading = false;
          console.log(responds);
        },
        error: error => {
          this.alertService.error(error);
          this.loading = false;
        }
      });
  }


  checkPasswords() {
    let pass = this.f.password.value;
    let confirmPass = this.f.password2.value;
    return pass === confirmPass ? null : { notSame: true }
  }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.accountService.register(this.form.value)
      .pipe(first())
      .subscribe({
        next: (responds) => {
          console.log(responds);
          if (responds.success) {
            this.alertService.success('Registration Successful!!', { keepAfterRouteChange: true });
            this.router.navigate(['../login'], { relativeTo: this.route });
          }
          else {
            this.alertService.error("Not registered!");
            this.loading = false;
          }
        },
        error: error => {
          this.alertService.error(error);
          this.loading = false;
        }
      });
  }


}

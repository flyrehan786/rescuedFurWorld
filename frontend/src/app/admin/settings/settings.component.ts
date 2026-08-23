import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UploadService } from '../../services/upload.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return newPassword === confirmPassword ? null : { mismatch: true };
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  profileForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    photo: ['']
  });

  uploadingPhoto = false;
  photoError = '';
  savingProfile = false;
  profileErrorMessage = '';
  profileSuccessMessage = '';

  form: FormGroup = this.fb.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    },
    { validators: passwordsMatch }
  );

  saving = false;
  errorMessage = '';
  successMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private uploadService: UploadService) {}

  ngOnInit(): void {
    this.profileForm.patchValue({
      username: this.authService.username || '',
      photo: this.authService.photo || ''
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.photoError = '';
    this.uploadingPhoto = true;
    this.uploadService.uploadImage(file).subscribe({
      next: (res) => {
        this.profileForm.patchValue({ photo: res.url });
        this.uploadingPhoto = false;
        input.value = '';
      },
      error: () => {
        this.photoError = 'Photo upload failed. Please try again.';
        this.uploadingPhoto = false;
        input.value = '';
      }
    });
  }

  removePhoto(): void {
    this.profileForm.patchValue({ photo: '' });
  }

  saveProfile(): void {
    if (this.profileForm.invalid || this.savingProfile) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.savingProfile = true;
    this.profileErrorMessage = '';
    this.profileSuccessMessage = '';

    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.savingProfile = false;
        this.profileSuccessMessage = 'Profile updated successfully.';
      },
      error: (err) => {
        this.savingProfile = false;
        this.profileErrorMessage = err?.error?.message || 'Could not update profile.';
      }
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { currentPassword, newPassword } = this.form.value;
    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = 'Password updated successfully.';
        this.form.reset();
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err?.error?.message || 'Could not update password.';
      }
    });
  }
}

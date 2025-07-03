import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-client',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-client.component.html',
  styleUrls: ['./edit-client.component.scss']
})
export class EditClientComponent {
  @Output() clientUpdated = new EventEmitter<any>();
  isOpen = false;
  clientForm: FormGroup;
  private clientId: string | null = null;

  constructor(private fb: FormBuilder) {
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.email]],
      phone: [''],
      address: ['']
    });
  }

  open(client: any): void {
    this.isOpen = true;
    this.clientId = client.id;
    this.clientForm.patchValue({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address
    });
  }

  close(): void {
    this.isOpen = false;
    this.clientForm.reset();
    this.clientId = null;
  }

  onSubmit(): void {
    if (this.clientForm.valid && this.clientId) {
      this.clientUpdated.emit({ id: this.clientId, ...this.clientForm.value });
      this.close();
    }
  }
}

import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.scss']
})
export class EditEmployeeComponent {
  @Output() employeeUpdated = new EventEmitter<any>();
  isOpen = false;
  employeeForm: FormGroup;
  private employeeId: string | null = null;

  constructor(private fb: FormBuilder) {
    this.employeeForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      role: ['', Validators.required],
      address: ['', Validators.required],
      salary: [null, [Validators.required, Validators.min(0)]],
      hiredate: ['', Validators.required],
      status: ['', Validators.required],
    });
  }

  open(employee: any): void {
    this.isOpen = true;
    this.employeeId = employee.id;
    this.employeeForm.patchValue({
      name: employee.name,
      email: employee.email,
      role: employee.role,
      phone: employee.phone,
      address: employee.address,
      salary: employee.salary,
      hiredate: employee.hiredate,
      status: employee.status
    });
  }

  close(): void {
    this.isOpen = false;
    this.employeeForm.reset();
    this.employeeId = null;
  }

  onSubmit(): void {
    if (this.employeeForm.valid && this.employeeId) {
      const formValue = this.employeeForm.value;

      const payload: any = {
        id: this.employeeId,
        name: formValue.name,
        email: formValue.email,
        phone: formValue.phone,
        role: formValue.role,
        address: formValue.address,
        salary: formValue.salary,
        hiredate: formValue.hiredate,
        status: formValue.status
      };

      this.employeeUpdated.emit(payload);
      this.close();
    }
  }
}

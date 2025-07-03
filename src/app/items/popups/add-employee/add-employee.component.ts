import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgIf, CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    CommonModule
  ],
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.scss']
})
export class AddEmployeeComponent {
  isVisible = false;
  @Output() employeeAdded = new EventEmitter<{ employee: any }>();

  employee = {
    name: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    salary: null as number | null,
    hiredate: '',
    status: ''
  };

  constructor(private snackBar: MatSnackBar) {}

  open(): void {
    this.isVisible = true;
    this.resetForm();
  }

  close(): void {
    this.isVisible = false;
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios.', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    this.employeeAdded.emit({ employee: this.employee });
    this.close();
  }

  private resetForm(): void {
    this.employee = {
      name: '',
      email: '',
      phone: '',
      address: '',
      role: '',
      salary: null,
      hiredate: '',
      status: ''
    };
  }
}

import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgIf, CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-client',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    CommonModule
  ],
  templateUrl: './add-client.component.html',
  styleUrls: ['./add-client.component.scss']
})
export class AddClientComponent {
  isVisible = false;
  @Output() clientAdded = new EventEmitter<{ client: any, file: File | null }>();

  client = {
    name: '',
    email: '',
    phone: '',
    address: '',
  };

  selectedFile: File | null = null;

  constructor(private snackBar: MatSnackBar) {}

  open(): void {
    this.isVisible = true;
  }

  close(): void {
    this.isVisible = false;
    this.resetForm();
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios.', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    this.clientAdded.emit({ client: this.client, file: this.selectedFile });
    this.close();
  }

  private resetForm(): void {
    this.client = {
      name: '',
      email: '',
      phone: '',
      address: '',
    };
    this.selectedFile = null;
  }
}

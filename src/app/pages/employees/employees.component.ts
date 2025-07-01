import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../auth.service';
import { SearchBarComponent } from "../../items/search-bar/search-bar.component";
import { IconBtnComponent } from '../../items/icon-btn/icon-btn.component';
import { EmployeesTableComponent } from '../../items/employees-table/employees-table.component';
import { AddEmployeeComponent } from '../../items/popups/add-employee/add-employee.component';
import { CommonModule } from '@angular/common';
import { EditEmployeeComponent } from '../../items/popups/edit-employee/edit-employee.component';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    SearchBarComponent,
    IconBtnComponent,
    EmployeesTableComponent,
    AddEmployeeComponent,
    EditEmployeeComponent
  ],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  employees: any[] = [];
  private readonly urlAPIEmployees = `http://${environment.host}/api/employees/`;

  @ViewChild('employeeModal') employeeModal!: AddEmployeeComponent;
  @ViewChild('editEmployeeModal') editEmployeeModal!: EditEmployeeComponent;

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.http.get<any[]>(`${this.urlAPIEmployees}`, { withCredentials: true }).subscribe({
      next: (data) => {
        this.employees = data;
        console.log('Funcionários carregados:', data);
      },
      error: (err) => {
        console.error('Erro ao carregar funcionários:', err);
        this.snackBar.open('Erro ao carregar funcionários', 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  openAddEmployeePopup(): void {
    this.employeeModal.open();
  }

  handleOpenEditEmployee(employee: any): void {
    this.editEmployeeModal.open(employee);
  }

  handleEmployeeAdded(event: {employee: any}): void {
    const { employee } = event;
    const ownerId = this.authService.getOwnerId();

    if (!ownerId) {
      this.snackBar.open('ID do usuário não encontrado. Não é possível adicionar funcionário.', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const employeePayload = {
      ...employee,
    };

    this.http.post(this.urlAPIEmployees, employeePayload).subscribe({
      next: (response: any) => {
        console.log('Funcionário adicionado com sucesso:', response);
        this.employees.push(response);
        this.snackBar.open(`Funcionário ${response.name} adicionado!`, 'Fechar', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.loadEmployees();
      },
      error: (error) => {
        console.error('Erro ao adicionar funcionário:', error);
        this.snackBar.open('Erro ao adicionar funcionário. Verifique os dados e tente novamente.', 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  handleDeleteEmployee(employeeId: string): void {
    // Confirmação com o usuário antes de excluir
    if (confirm('Tem certeza de que deseja excluir este funcionario?')) {
      this.http.delete(`${this.urlAPIEmployees}${employeeId}`, { withCredentials: true }).subscribe({
        next: () => {
          this.snackBar.open('Funcionario excluído com sucesso!', 'Fechar', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          this.loadEmployees();
        },
        error: (error) => {
          console.error('Erro ao excluir funcionario:', error);
          this.snackBar.open('Erro ao excluir funcionario.', 'Fechar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  handleEmployeeUpdated(employeeData: any): void {
    const { id, ...updatePayload } = employeeData; // Separa o ID do restante dos dados
    this.http.put(`${this.urlAPIEmployees}${id}`, updatePayload, { withCredentials: true }).subscribe({
      next: () => {
        this.snackBar.open('Funcionario atualizado com sucesso!', 'Fechar', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.loadEmployees(); // Recarrega a lista para mostrar os dados atualizados
      },
      error: (error) => {
        console.error('Erro ao atualizar funcionario:', error);
        this.snackBar.open('Erro ao atualizar funcionario.', 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}

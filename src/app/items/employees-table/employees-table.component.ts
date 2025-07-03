import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, NgForOf, DatePipe } from '@angular/common';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-employees-table',
  standalone: true,
  imports: [
    NgForOf,
    CommonModule,
    DatePipe,
    MatIconModule
  ],
  templateUrl: './employees-table.component.html',
  styleUrls: ['./employees-table.component.scss']
})
export class EmployeesTableComponent {
  @Input() data: any[] = [];
  @Output() onDeleteEmployee = new EventEmitter<string>();
  @Output() onEditEmployee = new EventEmitter<any>();

  displayedColumns: string[] = [
    'name',
    'role',
    'email',
    'phone',
    'address',
    'salary',
    'hiredate',
    'status',
    'actions'
  ];

  constructor() {}

  editEmployee(employee: any): void {
    this.onEditEmployee.emit(employee);
  }

  deleteEmployee(employeeId: string): void {
    this.onDeleteEmployee.emit(employeeId);
  }
}

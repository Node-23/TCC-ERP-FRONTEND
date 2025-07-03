import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, NgForOf } from '@angular/common';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-clients-table',
  standalone: true,
  imports: [
    NgForOf,
    CommonModule,
    MatIconModule
  ],
  templateUrl: './clients-table.component.html',
  styleUrls: ['./clients-table.component.scss']
})
export class ClientsTableComponent {
  @Input() data: any[] = [];
  @Output() onDeleteClient = new EventEmitter<string>();
  @Output() onEditClient = new EventEmitter<any>();

  displayedColumns: string[] = ['name', 'email', 'phone', 'address', 'actions'];

  constructor() {}

  editClient(client: any): void {
    this.onEditClient.emit(client);
  }

  deleteClient(clientId: string): void {
    this.onDeleteClient.emit(clientId)
  }
}

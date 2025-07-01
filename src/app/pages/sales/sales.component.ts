import {Component, ViewChild} from '@angular/core';
import {SearchBarComponent} from "../../items/search-bar/search-bar.component";
import {IconBtnComponent} from '../../items/icon-btn/icon-btn.component';
import { HttpClient } from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AddSaleComponent} from '../../items/popups/add-sale/add-sale.component';
import {SalesTableComponent} from '../../items/sales-table/sales-table.component';
import { environment } from '../../../environments/environment.prod';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-sales',
  imports: [
    IconBtnComponent,
    SearchBarComponent,
    AddSaleComponent,
    SalesTableComponent,
  ],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.scss'
})

export class SalesComponent {
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  sales: any[] = [];
  clients: any[] = [];
  employees: any[] = [];
  products: any[] = [];
  urlAPISales: string = `http://${environment.host}/api/sales/`;
  urlAPIProducts: string = `http://${environment.host}/api/inventory/products/`;
  urlAPICustomers: string = `http://${environment.host}/api/customers/`;
  urlAPIEmployees: string = `http://${environment.host}/api/employees/`;

  @ViewChild('salesModal') saleModal!: AddSaleComponent;

  ngOnInit(): void {
    this.loadSalesAndRelatedData();
  }

  loadSalesAndRelatedData(): void {
  forkJoin({
    sales: this.http.get<any[]>(this.urlAPISales, { withCredentials: true }),
    customers: this.http.get<any[]>(this.urlAPICustomers, { withCredentials: true }),
    employees: this.http.get<any[]>(this.urlAPIEmployees, { withCredentials: true }),
    products: this.http.get<any[]>(this.urlAPIProducts, { withCredentials: true })
  }).subscribe({
    next: (data: { sales: any[], customers: any[], employees: any[], products: any[] }) => {
      this.sales = data.sales;
      this.clients = data.customers;
      this.employees = data.employees;
      this.products = data.products;
      console.log('Todos os dados carregados:', data);
    },
    error: (err) => {
      console.error('Erro ao carregar dados:', err);
      this.snackBar.open('Erro ao carregar dados de vendas, clientes, funcionários ou produtos', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  });
}

  openPopup() {
    this.saleModal.open(this.clients, this.employees, this.products);
  }

  handleDeleteSale(saleId: string): void {
    if (confirm('Tem certeza de que deseja excluir esta venda?')) {
      this.http.delete(`${this.urlAPISales}${saleId}`, { withCredentials: true }).subscribe({
        next: () => {
          this.snackBar.open('Venda excluída com sucesso!', 'Fechar', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          this.loadSalesAndRelatedData();
        },
        error: (error) => {
          console.error('Erro ao excluir venda:', error);
          this.snackBar.open('Erro ao excluir venda.', 'Fechar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}


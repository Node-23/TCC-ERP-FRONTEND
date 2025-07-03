import {Component, OnInit, ViewChild} from '@angular/core';
import {SearchBarComponent} from "../../items/search-bar/search-bar.component";
import {IconBtnComponent} from '../../items/icon-btn/icon-btn.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AddSaleComponent} from '../../items/popups/add-sale/add-sale.component';
import {SalesTableComponent} from '../../items/sales-table/sales-table.component';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    IconBtnComponent,
    SearchBarComponent,
    AddSaleComponent,
    SalesTableComponent,
    CommonModule
  ],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.scss'
})

export class SalesComponent implements OnInit{
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  sales: any[] = [];
  clients: any[] = [];
  employees: any[] = [];
  products: any[] = [];
  urlAPISales: string = 'http://localhost:8080/api/sales/';

  @ViewChild('salesModal') saleModal!: AddSaleComponent;

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    } else {
      return;
    }

    this.http.get<any>(`${this.urlAPISales}overview`, { headers: headers, withCredentials: true }).subscribe({
      next: (data) => {
        this.clients = data.customers;
        this.employees = data.employees;
        this.sales = data.sales;
        this.products = data.products;
      },
      error: (err) => {
        this.snackBar.open('Erro ao carregar dados de vendas, clientes e funcionários', 'Fechar', {
          duration: 2000,
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
      const token = this.authService.getToken();
      let headers = new HttpHeaders();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
      this.http.delete(`${this.urlAPISales}${saleId}`, { headers: headers, withCredentials: true }).subscribe({
        next: () => {
          this.snackBar.open('Venda excluída com sucesso!', 'Fechar', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          this.loadSales();
        },
        error: (error) => {
          this.snackBar.open('Erro ao excluir venda.', 'Fechar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}

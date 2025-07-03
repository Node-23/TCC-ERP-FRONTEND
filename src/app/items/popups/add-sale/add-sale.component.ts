import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {AuthService} from '../../../auth.service';

interface Product { id: string; name: string; price: number; quantity: number; }
interface SaleItem { productId: string; quantity: number; productName?: string; price: number; }
interface Employee { id: string; name: string; }
interface Client { id: string; name: string; email: string; address: string; phone: string; }

@Component({
  selector: 'app-add-sale',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgFor,
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './add-sale.component.html',
  styleUrl: './add-sale.component.scss'
})
export class AddSaleComponent implements OnInit {
  isVisible = false;

  @Input() clients: Client[] = [];
  @Input() employees: Employee[] = [];
  @Input() availableProducts: Product[] = [];
  @Output() saleAdded = new EventEmitter<void>();

  sale = {
    id: '',
    employee: '',
    client: '',
    value: 0,
    paymentMethod: '',
  // @ts-ignore
    date: new Date(),
    products: [] as SaleItem[]
  };

  outputSale = {
    clientId: '',
    employeeId: '',
    date: '',
    paymentMethod: '',
    items: [] as SaleItem[]
  };

  paymentMethods: string[] = ["CRÉDITO", "DÉBITO", "PIX", "DINHEIRO"];

  urlAPISales: string = 'http://localhost:8080/api/sales/';

  selectedProductId: string | null = null;
  selectedProductQuantity: number = 1;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
  }

  open(clients: Client[], employees: Employee[], products: Product[]): void {
    this.isVisible = true;
    this.clients = clients;
    this.employees = employees;
    this.availableProducts = products;
    this.resetForm();
  }

  close() {
    this.isVisible = false;
    this.resetForm();
  }

  addProductToSale(): void {
    if (!this.selectedProductId || this.selectedProductQuantity <= 0) {
      this.snackBar.open('Selecione um produto e uma quantidade válida.', 'Fechar', { duration: 3000, panelClass: ['error-snackbar'] });
      return;
    }

    const productToAdd = this.availableProducts.find(
      (p) => p.id === this.selectedProductId
    );

    if (!productToAdd) {
      this.snackBar.open('Produto selecionado não encontrado.', 'Fechar', { duration: 3000, panelClass: ['error-snackbar'] });
      return;
    }

    const availableStock = productToAdd.quantity;
    let newQuantityInSale = this.selectedProductQuantity;

    const existingItemIndex = this.sale.products.findIndex(item => item.productId === productToAdd.id);

    if (existingItemIndex > -1) {
      const existingItem = this.sale.products[existingItemIndex];
      newQuantityInSale = existingItem.quantity + this.selectedProductQuantity;
    }

    if (newQuantityInSale > availableStock) {
      this.snackBar.open(
        `Quantidade excede o estoque disponível (${availableStock} unidades).`,
        'Fechar',
        { duration: 4000, panelClass: ['error-snackbar'] }
      );
      return;
    }

    if (existingItemIndex > -1) {
      this.sale.products[existingItemIndex].quantity = newQuantityInSale;
    } else {
      this.sale.products.push({
        productId: productToAdd.id,
        quantity: this.selectedProductQuantity,
        productName: productToAdd.name,
        price: productToAdd.price,
      });
    }

    this.calculateTotalValue();
    this.selectedProductId = null;
    this.selectedProductQuantity = 1;
  }


  removeProductFromSale(index: number): void {
    this.sale.products.splice(index, 1);
    this.calculateTotalValue();
  }


  calculateTotalValue(): void {
    this.sale.value = this.sale.products.reduce((sum, item) => {
      const product = this.availableProducts.find(p => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  }

  onSubmit() {
    if (!this.sale.paymentMethod || this.sale.paymentMethod.trim().length === 0) {
      this.snackBar.open('Informe o método de pagamento.', 'Fechar', { duration: 3000, panelClass: ['error-snackbar'] });
      return;
    }

    if (this.sale.products.length === 0) {
      this.snackBar.open('Adicione pelo menos um produto à venda.', 'Fechar', { duration: 3000, panelClass: ['error-snackbar'] });
      return;
    }

    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    } else {
      return;
    }

    this.outputSale.employeeId = this.sale.employee;
    this.outputSale.clientId = this.sale.client;
    this.outputSale.paymentMethod = this.sale.paymentMethod;
    // @ts-ignore
    this.outputSale.date = new Date(this.sale.date).toISOString();
    this.outputSale.items = this.sale.products;

    this.http.post(this.urlAPISales, this.outputSale, {headers: headers, withCredentials: true }).subscribe({
      next: (response) => {
        this.snackBar.open(`Venda registrada!`, 'Fechar', {
          duration: 1000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.saleAdded.emit();
        this.close();
      },
      error: (error) => {
        this.snackBar.open('Erro ao registrar venda', 'Fechar', {
          duration: 1000,
          panelClass: ['error-snackbar']
        });
      },
    });
  }

  private resetForm(): void {

    this.sale = {
      id: '',
      employee: '',
      client: '',
      value: 0,
      paymentMethod: '',
      // @ts-ignore
      date: new Date(),
      products: [] as SaleItem[]
    };

    this.outputSale = {
      clientId: '',
      employeeId: '',
      date: '',
      paymentMethod: '',
      items: [] as SaleItem[]
    };

    this.selectedProductId = null;
    this.selectedProductQuantity = 1;
  }
}

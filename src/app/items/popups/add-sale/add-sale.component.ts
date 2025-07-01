import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, CommonModule } from '@angular/common';


import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { environment } from '../../../../environments/environment.prod';

interface Product { id: string; name: string; price: number; quantity: number; }
interface SaleItem { product_id: string; quantity: number; price: number; discount?: number; productName?: string; } // Adicionado discount como opcional
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
    date: new Date(),
    products: [] as SaleItem[],
    status: 'PENDING'
  };

  outputSale = {
    client_id: '',
    employee_id: '',
    date: '',       
    payment_method: '',
    items: [] as SaleItem[],
    status: 'PENDING'
  };

  paymentMethods: string[] = ["CRÉDITO", "DÉBITO", "PIX", "DINHEIRO"];

  urlAPISales: string = `http://${environment.host}/api/sales/`;

  selectedProductId: string | null = null;
  selectedProductQuantity: number = 1;

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

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

    const existingItemIndex = this.sale.products.findIndex(item => item.product_id === productToAdd.id);

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
        product_id: productToAdd.id,
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
      const product = this.availableProducts.find(p => p.id === item.product_id);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  }

  onSubmit() {
    if (!this.sale.employee || !this.sale.client) { // Adicionada validação de employee e client
      this.snackBar.open('Selecione o vendedor e o cliente.', 'Fechar', { duration: 3000, panelClass: ['error-snackbar'] });
      return;
    }
    if (!this.sale.paymentMethod || this.sale.paymentMethod.trim().length === 0) {
      this.snackBar.open('Informe o método de pagamento.', 'Fechar', { duration: 3000, panelClass: ['error-snackbar'] });
      return;
    }

    if (this.sale.products.length === 0) {
      this.snackBar.open('Adicione pelo menos um produto à venda.', 'Fechar', { duration: 3000, panelClass: ['error-snackbar'] });
      return;
    }

    this.outputSale.employee_id = this.sale.employee; // Mapeado para employee_id
    this.outputSale.client_id = this.sale.client;     // Mapeado para client_id
    this.outputSale.payment_method = this.sale.paymentMethod; // Mapeado para payment_method
    this.outputSale.date = new Date(this.sale.date).toISOString(); // Formato ISO 8601
    // Os itens são mapeados do this.sale.products, garantindo que usem product_id
    this.outputSale.items = this.sale.products.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      // discount é opcional no backend, então não precisamos enviar se não for definido
      ...(item.discount !== undefined && { discount: item.discount })
    }));

    this.http.post(this.urlAPISales, this.outputSale, { withCredentials: true }).subscribe({
      next: (response) => {
        console.log('Venda registrada com sucesso:', response);
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
        console.error('Erro ao registrar venda:', error);
        let errorMessage = 'Erro ao registrar venda.';
        if (error.error && error.error.msg) {
          errorMessage = error.error.msg;
        } else if (error.error && error.error.error) {
          errorMessage = error.error.error;
        }
        this.snackBar.open(errorMessage, 'Fechar', {
          duration: 3000,
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
      status: 'PENDING',
      date: new Date(),
      products: [] as SaleItem[]
    };

    this.outputSale = {
      client_id: '',
      employee_id: '',
      date: '',
      payment_method: '',
      items: [] as SaleItem[],
      status: 'PENDING'
    };

    this.selectedProductId = null;
    this.selectedProductQuantity = 1;
  }
}

import {Component, OnInit, ViewChild} from '@angular/core';
import {SearchBarComponent} from "../../items/search-bar/search-bar.component";
import {IconBtnComponent} from '../../items/icon-btn/icon-btn.component';
import {ItemsTableComponent} from '../../items/items-table/items-table.component';
import {AddProductComponent} from '../../items/popups/add-product/add-product.component';
import { HttpClient } from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from '../../auth.service';
import { CommonModule } from '@angular/common';
import { EditProductComponent } from '../../items/popups/edit-product/edit-product.component';


@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    SearchBarComponent,
    IconBtnComponent,
    ItemsTableComponent,
    AddProductComponent,
    EditProductComponent,
    CommonModule
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  products: any[] = [];
  urlAPIProducts: string = 'http://localhost:8080/api/inventory/products/';

  @ViewChild('productModal') productModal!: AddProductComponent;
  @ViewChild('editProductModal') editProductModal!: EditProductComponent;

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.http.get<any[]>(`${this.urlAPIProducts}`, { withCredentials: true }).subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => {
        this.snackBar.open('Erro ao carregar produtos', 'Fechar', {
          duration: 2000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  openPopup() {
    this.productModal.open();
  }

  handleOpenEditProduct(product: any): void {
    this.editProductModal.open(product);
  }

  handleProductAdded(event: { product: any; file: File | null }): void {
    const { product, file } = event;

    const formData = new FormData();

    product.ownerId = this.authService.getOwnerId();
    formData.append('product', new Blob([JSON.stringify(product)], { type: 'application/json' }));

    if (file) {
      formData.append('image', file);
    }


    this.http.post(this.urlAPIProducts, formData).subscribe({
      next: (response) => {
        this.snackBar.open(`${product.name} cadastrado!`, 'Fechar', {
          duration: 1000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.loadProducts();
      },
      error: (error) => {
        this.snackBar.open('Erro ao cadastrar produto', 'Fechar', {
          duration: 1000,
          panelClass: ['error-snackbar']
        });
      },
    });
  }

  handleDeleteProduct(productId: string): void {
    if (confirm('Tem certeza de que deseja excluir este produto?')) {
      this.http.delete(`${this.urlAPIProducts}${productId}`, { withCredentials: true }).subscribe({
        next: () => {
          this.snackBar.open('Produto excluído com sucesso!', 'Fechar', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          this.loadProducts();
        },
        error: (error) => {
          this.snackBar.open('Erro ao excluir produto.', 'Fechar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  handleProductUpdated(event: { product: any; file: File | null }): void {
    const { product, file } = event;
    const formData = new FormData();

    formData.append('product', new Blob([JSON.stringify(product)], { type: 'application/json' }));

    if (file) {
      formData.append('image', file);
    }

    this.http.put(`${this.urlAPIProducts}${product.id}`, formData).subscribe({
      next: () => {
        this.snackBar.open('Produto atualizado com sucesso!', 'Fechar', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.loadProducts();
      },
      error: (error) => {
        this.snackBar.open('Erro ao atualizar produto.', 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}

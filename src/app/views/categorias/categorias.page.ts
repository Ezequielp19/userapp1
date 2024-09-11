import { FirestoreService } from './../../common/services/firestore.service';
import { Categoria } from './../../common/models/categoria.models';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertController,ToastController,IonicModule, } from '@ionic/angular';
import { AuthService } from '../../common/services/auth.service';





import { IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonList, IonItem, IonCard, IonInput, IonSpinner, IonButtons, IonButton, IonIcon, IonImg , IonCardHeader, IonCardContent, IonCardTitle} from '@ionic/angular/standalone';
import { IoniconsModule } from 'src/app/common/modules/ionicons.module';

@Component({
  selector: 'app-categorias',
  standalone: true,
 imports: [
    // CommonModule,
    // FormsModule,
    // RouterLink,
    // IonHeader,
    // IonToolbar,
    // IonTitle,
    // IonContent,
    // IonLabel,
    // IonList,
    // IonItem,
    // IonCard,
    // IonInput,
    // IonSpinner,
    // IonButtons,
    // IonButton,
    // IonIcon,
    // IonImg,
    // IonCardHeader,
    // IonCardContent,
    // IonCardTitle
     CommonModule,
    FormsModule,
    RouterLink,
    IonicModule,
    IoniconsModule
  ],
  templateUrl: './categorias.page.html',
  styleUrls: ['./categorias.page.scss'],
})
export class CategoriaPage {

   nombre: string = '';
  descripcion: string = '';
    categorias: Categoria[] = [];
     paginaActual: number = 1;
  categoriasPorPagina: number = 5;
  totalCategorias: number = 0;
  categoriasPaginas: Categoria[] = [];



  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private FirestoreService: FirestoreService,
    private toastController: ToastController
  ) {}


   ngOnInit() {
    this.cargarCategorias();
  }

  async cargarCategorias() {
    this.FirestoreService.getCollectionChanges<Categoria>('categorias').subscribe(
      data => {
        this.totalCategorias = data.length;
        this.categorias = data;
        this.actualizarCategoriasPagina();
      },
      error => {
        console.error('Error al cargar categorías:', error);
      }
    );
  }

  actualizarCategoriasPagina() {
    const inicio = (this.paginaActual - 1) * this.categoriasPorPagina;
    const fin = inicio + this.categoriasPorPagina;
    this.categoriasPaginas = this.categorias.slice(inicio, fin);
  }

  cambiarPagina(direccion: number) {
    const nuevaPagina = this.paginaActual + direccion;
    const totalPaginas = Math.ceil(this.totalCategorias / this.categoriasPorPagina);
    if (nuevaPagina > 0 && nuevaPagina <= totalPaginas) {
      this.paginaActual = nuevaPagina;
      this.actualizarCategoriasPagina();
    }
  }

  async borrarCategoria(categoriaId: string) {
    try {
      await this.FirestoreService.deleteCategoria(categoriaId);
      this.mostrarToast('Categoría eliminada exitosamente', 'success');
      this.cargarCategorias(); // Recargar la lista de categorías después de eliminar
    } catch (error) {
      console.error('Error al eliminar la categoría:', error);
      this.mostrarToast('Error al eliminar la categoría', 'danger');
    }
  }

  async agregarCategoria() {
    if (this.nombre.trim().length === 0) {
      this.mostrarToast('El nombre de la categoría es obligatorio', 'danger');
      return;
    }

    const nuevaCategoria: Categoria = {
      nombre: this.nombre,
      descripcion: this.descripcion,
      fechaCreacion: new Date(),
    };

    try {
      await this.FirestoreService.createCategoria(nuevaCategoria);
      this.mostrarToast('Categoría creada exitosamente', 'success');
      this.nombre = '';
      this.descripcion = '';
      this.cargarCategorias(); // Recargar la lista de categorías después de agregar
    } catch (error) {
      console.error('Error al crear la categoría:', error);
      this.mostrarToast('Error al crear la categoría', 'danger');
    }
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
    });
    toast.present();
  }

  get totalPaginas(): number {
    return Math.ceil(this.totalCategorias / this.categoriasPorPagina);
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertController, ToastController, IonicModule } from '@ionic/angular';
import { FirestoreService } from './../../common/services/firestore.service';
import { Categoria } from './../../common/models/categoria.models';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';



@Component({
  selector: 'app-apk',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './apk.component.html',
  styleUrls: ['./apk.component.scss'],
})
export class ApkComponent  implements OnInit {

nombreApk: string = '';
  descripcionApk: string = '';
  categoriaSeleccionada: string | null = null;
  apks: any[] = [];
  categorias: Categoria[] = [];

  imagenArchivo: File | null = null;
  apkArchivo: File | null = null;

  constructor(
    private FirestoreService: FirestoreService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.cargarCategorias();
    this.cargarApks();
  }

  async cargarCategorias() {
    this.FirestoreService.getCollectionChanges<Categoria>('categorias').subscribe(
      (data) => {
        this.categorias = data;
      },
      (error) => {
        console.error('Error al cargar categorías:', error);
      }
    );
  }

  async cargarApks() {
    this.FirestoreService.getCollectionChanges<any>('apks').subscribe(
      (data) => {
        this.apks = data;
      },
      (error) => {
        console.error('Error al cargar APKs:', error);
      }
    );
  }

  onFileSelected(event: any, tipo: string) {
    const file = event.target.files[0];
    if (tipo === 'imagen') {
      this.imagenArchivo = file;
    } else if (tipo === 'apk') {
      this.apkArchivo = file;
    }
  }

//   async subirApk() {
//     if (!this.apkArchivo) {
//       this.mostrarToast('Debe seleccionar un archivo APK', 'danger');
//       return;
//     }

//     const id = uuidv4();
//    const apkData: {
//   id: string;
//   nombre: string;
//   descripcion: string;
//   categoriaId: string | null;
//   fechaCreacion: Date;
//   imagenUrl?: string;
//   apkUrl?: string;
// } = {
//   id,
//   nombre: this.nombreApk,
//   descripcion: this.descripcionApk,
//   categoriaId: this.categoriaSeleccionada,
//   fechaCreacion: new Date(),
// };

//     try {

// if (this.imagenArchivo) {
//   const imagenUrl = await this.FirestoreService.uploadFile(this.imagenArchivo, `imagenes/${id}`);
//   apkData.imagenUrl = imagenUrl;
// }

// const apkUrl = await this.FirestoreService.uploadFile(this.apkArchivo, `apks/${id}`);
// apkData.apkUrl = apkUrl;

//       await this.FirestoreService.createDocument(apkData, `apks/${id}`);
//       this.mostrarToast('APK subido exitosamente', 'success');
//       this.nombreApk = '';
//       this.descripcionApk = '';
//       this.imagenArchivo = null;
//       this.apkArchivo = null;
//       this.cargarApks();
//     } catch (error) {
//       console.error('Error al subir el APK:', error);
//       this.mostrarToast('Error al subir el APK', 'danger');
//     }
//   }

  async borrarApk(apkId: string) {
    try {
      await this.FirestoreService.deleteDocumentID('apks', apkId);
      this.mostrarToast('APK eliminado exitosamente', 'success');
      this.cargarApks(); // Recargar la lista de APKs después de eliminar
    } catch (error) {
      console.error('Error al eliminar el APK:', error);
      this.mostrarToast('Error al eliminar el APK', 'danger');
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
}

import { Platform } from '@ionic/angular';
import { IonHeader, IonToolbar, IonContent, IonLabel, IonItem, IonInput, IonSegmentButton, IonIcon, IonSegment, IonButtons, IonTitle, IonButton, IonMenu, IonList, IonMenuButton } from '@ionic/angular/standalone';

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../common/services/firestore.service';
import { Apk } from '../../common/models/apk.model';
import { Categoria } from './../../common/models/categoria.models';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';  // Asegúrate de importar FormsModule
import { Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';



import { File } from '@awesome-cordova-plugins/file/ngx'; // Importa File
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Importa HttpClient


import { getDownloadURL, getStorage, ref } from 'firebase/storage';

import { Capacitor } from '@capacitor/core';






@Component({
  selector: 'app-apk-list',
  standalone: true,
  imports: [CommonModule ,HttpClientModule, IonHeader, IonButtons, IonToolbar, IonIcon, IonContent, IonSegment, IonSegmentButton, IonLabel, IonInput, IonItem, IonTitle, IonButton, IonMenu, IonList, IonMenuButton],
  templateUrl: './apklist.component.html',
  styleUrls: ['./apklist.component.scss'],
})
export class ApkListComponent implements OnInit {
  apks$: Observable<Apk[]>;

   categorias$: Observable<Categoria[]>;
  filteredApks$: Observable<Apk[]>;
  selectedCategory: string = '';

    private categoryFilter$ = new BehaviorSubject<string>('');


  constructor(private firestoreService: FirestoreService,private router: Router, private file: File,  // Inyecta File
    private http: HttpClient, // Inyecta HttpClient
    private platform: Platform  // Inyecta Platform
) {}

  ngOnInit() {
        this.getApkUrl();

    this.apks$ = this.firestoreService.getApks();
    this.categorias$ = this.firestoreService.getCategorias();

    this.filteredApks$ = combineLatest([this.apks$, this.categoryFilter$]).pipe(
      map(([apks, filter]) =>
        filter ? apks.filter(apk => apk.categoriaId === filter) : apks
      )
    );
  }

  navigateToDetail(apkId: string) {
    this.router.navigate(['/apk', apkId]);
  }

  filterApks() {
    this.categoryFilter$.next(this.selectedCategory);
  }


  // Llamar al servicio para descargar el APK
  // downloadApk(apkUrl: string) {
  //   this.firestoreService.downloadApkFromFirebase(apkUrl);
  // }


  apkUrl: string | undefined;

 async getApkUrl() {
    try {
      const apkList = await this.firestoreService.getApks().toPromise();
      if (apkList.length > 0) {
        this.apkUrl = apkList[0].apkUrl;
      } else {
        console.log('No se encontraron APKs.');
      }
    } catch (error) {
      console.error('Error al obtener la lista de APKs:', error);
    }
  }

 // Método simplificado para descargar el APK y guardarlo en Android
  async downloadAPK(apkUrl: string) {
    try {
      // Realiza una solicitud HTTP para obtener el APK como un Blob
      const response = await this.http.get(apkUrl, { responseType: 'blob' }).toPromise();

      // Convierte el Blob a una URL de objeto
      const blobUrl = window.URL.createObjectURL(response);

      // Convierte el Blob a base64 si estás en Android
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;

        if (this.platform.is('android')) {
          await Filesystem.writeFile({
            path: 'Download/app.apk', // Cambia el path a la carpeta de descargas de Android
            data: base64data.split(',')[1], // Elimina la cabecera base64
            directory: Directory.External, // Usa el almacenamiento externo en Android
            encoding: Encoding.UTF8
          });

          console.log('APK guardada en la carpeta de Descargas.');
        }
      };

      // Lee el Blob como un Data URL
      reader.readAsDataURL(response);
    } catch (error) {
      console.error('Error al descargar o guardar el APK:', error);
    }
  }

}




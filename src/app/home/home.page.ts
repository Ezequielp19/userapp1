import { IonicModule,Platform } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../app/common/services/firestore.service';
import { Apk } from '../../app/common/models/apk.model';
import { from, map, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { File } from '@awesome-cordova-plugins/file/ngx'; // Importa File
import { HttpClient } from '@angular/common/http'; // Importa HttpClient

@Component({
  selector: 'app-apk-list',
  standalone: true,
  imports: [IonicModule, CommonModule],  // Asegúrate de que IonicModule esté aquí
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class ApkListComponent implements OnInit {
 apk$: Observable<Apk>;

  constructor(
    private route: ActivatedRoute,
    private firestoreService: FirestoreService,
   private file: File,  // Inyecta File
    private http: HttpClient, // Inyecta HttpClient
    private platform: Platform  // Inyecta Platform
  ) {}
  
 ngOnInit() {
    const apkId = this.route.snapshot.paramMap.get('id');
    if (apkId) {
      // Convertir el Promise a Observable
      this.apk$ = from(this.firestoreService.getApkById(apkId)).pipe(
        map(apk => apk) // Pasar directamente el resultado
      );
    }
  }




 downloadApk(url: string, fileName: string) {
    if (this.platform.is('android')) {
      const path = this.file.externalDataDirectory + fileName + '.apk';

      // Descargar el archivo
      this.http.get(url, { responseType: 'blob' }).subscribe(
        (data: Blob) => {
          this.file.writeFile(this.file.externalDataDirectory, `${fileName}.apk`, data, { replace: true })
            .then(() => {
              console.log('APK descargado correctamente:', path);
            })
            .catch(error => {
              console.error('Error al escribir el archivo:', error);
            });
        },
        (error) => {
          console.error('Error al descargar el APK:', error);
        }
      );
    } else {
      console.error('Esta función solo está disponible en dispositivos Android.');
    }
  }
}





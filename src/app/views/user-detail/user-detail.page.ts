import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController, LoadingController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Storage, getDownloadURL, ref, uploadBytesResumable } from '@angular/fire/storage';
import { FirestoreService } from '../../common/services/firestore.service';
import { Observable } from 'rxjs';
import { IonHeader, IonToolbar, IonContent, IonLabel, IonItem, IonInput, IonSegmentButton, IonIcon, IonSegment, IonButtons, IonTitle, IonButton, IonMenu, IonList, IonMenuButton } from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonHeader, IonButtons, IonToolbar, IonIcon, IonContent, IonSegment, IonSegmentButton, IonLabel, IonInput, IonItem, IonTitle, IonButton, IonMenu, IonList, IonMenuButton],
  templateUrl: './user-detail.page.html',
  styleUrls: ['./user-detail.page.scss'],
})
export class UserDetailPage implements OnInit {
  userId: string;
  activeSection: string | null = 'usuario';

  usuarioForm: FormGroup;
  afipForm: FormGroup;
  certificacionIngresosForm: FormGroup;
  planesPagoForm: FormGroup;
  informacionPersonalForm: FormGroup;
  facturacionForm: FormGroup;
  declaracionJuradaForm: FormGroup;
  sueldosForm: FormGroup;
  f931Form: FormGroup;
  uploadProgress$: Observable<number>;

  isUploading: boolean = false; // Property to track if a file is being uploaded

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private fb: FormBuilder,
    private router: Router,
    private firestoreService: FirestoreService,
    private storage: Storage,
    private alertController: AlertController,
    private loadingController: LoadingController // Import LoadingController
  ) {}

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');

    this.usuarioForm = this.fb.group({
      dni: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.afipForm = this.fb.group({
      cuit: ['', Validators.required],
      claveFiscal: ['', Validators.required],
    });

    this.certificacionIngresosForm = this.fb.group({
      anio: ['', Validators.required],
      pdf: ['', Validators.required],
    });

    this.planesPagoForm = this.fb.group({
      pdf: ['', Validators.required],
    });

    this.informacionPersonalForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      direccion: ['', Validators.required],
      pdf: ['', Validators.required],
    });

    this.facturacionForm = this.fb.group({
      facturas: ['', Validators.required],
      pdf: ['', Validators.required],
    });

    this.declaracionJuradaForm = this.fb.group({
      pdf: ['', Validators.required],
    });

    this.f931Form = this.fb.group({
      pdf: ['', Validators.required],
    });

    this.sueldosForm = this.fb.group({
      pdf: ['', Validators.required],
      anio: ['', Validators.required],
      mes: ['', Validators.required]
    });

    this.loadUserData();
  }

  getTitle(): string {
    switch (this.activeSection) {
      case 'usuario':
        return 'Usuario';
      case 'categoria':
        return 'categorias';
      case 'certificacion-ingresos':
        return 'Certificación de Ingresos';
      case 'planes-pago':
        return 'Planes de Pago';
      case 'informacion-personal':
        return 'Información Personal';
      case 'facturacion':
        return 'Facturación';
      case 'declaracion-jurada':
        return 'Declaración Jurada';
      case 'sueldos':
        return 'Sueldos';
      case 'f931':
        return 'F931';
      case 'comprobante-pago':
        return 'Comprobante de Pago';
      default:
        return 'Detalles del Usuario';
    }
  }

  loadUserData() {
    this.firestoreService.getDocumentChanges<any>(`Usuarios/${this.userId}`).subscribe((userData: any) => {
      if (userData) {
        this.usuarioForm.patchValue({
          dni: userData.dni,
          password: userData.password,
        });

        this.afipForm.patchValue({
          cuit: userData.afip?.cuit,
          claveFiscal: userData.afip?.claveFiscal,
        });

        this.certificacionIngresosForm.patchValue({
          anio: userData.certificacionIngresos?.anio,
          pdf: userData.certificacionIngresos?.pdf,
        });

        this.planesPagoForm.patchValue({
          pdf: userData.planesPago?.pdf,
        });

        this.informacionPersonalForm.patchValue({
          nombre: userData.informacionPersonal?.nombre,
          apellido: userData.informacionPersonal?.apellido,
          direccion: userData.informacionPersonal?.direccion,
          pdf: userData.informacionPersonal?.pdf,
        });

        this.facturacionForm.patchValue({
          facturas: userData.facturacion?.facturas,
          pdf: userData.facturacion?.pdf,
        });

        this.declaracionJuradaForm.patchValue({
          pdf: userData.declaracionJurada?.pdf,
        });

        this.f931Form.patchValue({
          pdf: userData.f931Form?.pdf,
        });

        this.sueldosForm.patchValue({
          pdf: userData.sueldos?.pdf,
          anio: userData.sueldos?.año,
          mes: userData.sueldos?.mes
        });
      }
    });
  }

  async uploadFile(event: any, form: FormGroup, controlName: string) {
    this.isUploading = true; // Set isUploading to true when starting the upload

    const loading = await this.loadingController.create({
      message: 'Cargando archivo...',
    });
    await loading.present();

    const selectedFile: File = event.target.files[0];
    const filePath = `archivos/${selectedFile.name}`;
    const fileRef = ref(this.storage, filePath);
    const uploadTask = uploadBytesResumable(fileRef, selectedFile);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        this.uploadProgress$ = new Observable(observer => {
          observer.next(progress);
          observer.complete();
        });
        loading.message = `Progreso de la carga: ${progress.toFixed(2)}%`;
        console.log('Progreso de la carga:', progress);
      },
      (error) => {
        console.error('Error al cargar el archivo:', error);
        loading.dismiss();
        this.isUploading = false;
      },
      async () => {
        const url = await getDownloadURL(fileRef);
        console.log('URL del archivo:', url);
        form.patchValue({
          [controlName]: url
        });
        loading.dismiss();
        this.isUploading = false;
      }
    );
  }

  async showAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Notificación',
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  async saveUsuario() {
    if (this.isUploading) {
      this.showAlert('Espere a que termine la carga del archivo.');
      return;
    }
    this.firestoreService.updateDocument(this.usuarioForm.value, 'Usuarios', this.userId).then(() => {
      console.log('Usuario guardado', this.usuarioForm.value);
      this.showAlert('Usuario guardado exitosamente.');
    });
  }

  async saveAfip() {
    if (this.isUploading) {
      this.showAlert('Espere a que termine la carga del archivo.');
      return;
    }
    await this.saveSubcollectionData(this.afipForm, 'AFIP');
    this.showAlert('Datos de AFIP guardados exitosamente.');
  }

  async saveCertificacionIngresos() {
    if (this.isUploading) {
      this.showAlert('Espere a que termine la carga del archivo.');
      return;
    }
    await this.saveSubcollectionData(this.certificacionIngresosForm, 'certIngreso');
    this.showAlert('Certificación de ingresos guardada exitosamente.');
  }

  async savePlanesPago() {
    if (this.isUploading) {
      this.showAlert('Espere a que termine la carga del archivo.');
      return;
    }
    await this.saveSubcollectionData(this.planesPagoForm, 'planPago');
    this.showAlert('Plan de pago guardado exitosamente.');
  }

  async saveInformacionPersonal() {
    if (this.isUploading) {
      this.showAlert('Espere a que termine la carga del archivo.');
      return;
    }
    await this.saveSubcollectionData(this.informacionPersonalForm, 'infoPersonal');
    this.showAlert('Información personal guardada exitosamente.');
  }

  async saveFacturacion() {
    if (this.isUploading) {
      this.showAlert('Espere a que termine la carga del archivo.');
      return;
    }
    await this.saveSubcollectionData(this.facturacionForm, 'facturacion');
    this.showAlert('Facturación guardada exitosamente.');
  }

  async saveDeclaracionJurada() {
    if (this.isUploading) {
      this.showAlert('Espere a que termine la carga del archivo.');
      return;
    }
    await this.saveSubcollectionData(this.declaracionJuradaForm, 'declaracionJurada');
    this.showAlert('Declaración jurada guardada exitosamente.');
  }

  async saveSueldos() {
    if (this.isUploading) {
      this.showAlert('Espere a que termine la carga del archivo.');
      return;
    }
    await this.saveSubcollectionData(this.sueldosForm, 'sueldos');
    this.showAlert('Sueldos guardados exitosamente.');
  }

  async saveF931() {
    if (this.isUploading) {
      this.showAlert('Espere a que termine la carga del archivo.');
      return;
    }
    await this.saveSubcollectionData(this.f931Form, 'f931');
    this.showAlert('F931 guardado exitosamente.');
  }

  private async saveSubcollectionData(form: FormGroup, subcollection: string) {
    const userIdPath = `Usuarios/${this.userId}`;
    const docId = await this.firestoreService.getDocumentIdInSubcollection(userIdPath, subcollection);
    if (docId) {
      this.firestoreService.updateDocument(form.value, `${userIdPath}/${subcollection}`, docId).then(() => {
        console.log(`${subcollection} guardado`, form.value);
      });
    } else {
      console.error(`No se encontró documento en la subcolección ${subcollection}`);
    }
  }

  goBack() {
    window.history.back();
  }
  goHome(){
    this.router.navigate(['/home'])
  }
}

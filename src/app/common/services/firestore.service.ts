import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collectionData,
  collection,
  doc,
  docData,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  DocumentReference,
  DocumentData,
  WithFieldValue,
  UpdateData,
  getDocs,
  query,
  where,
} from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL,getStorage } from '@angular/fire/storage';
import { lastValueFrom, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Categoria } from '../models/categoria.models';
import { Apk } from '../models/apk.model';
import { UserI } from '../models/users.models';


import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { HttpClient } from '@angular/common/http';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { Platform } from '@ionic/angular';



import { Capacitor, Plugins } from '@capacitor/core';
const { PermissionsPlugin } = Plugins;





// Convertidor genérico para Firestore
const converter = <T>() => ({
  toFirestore: (data: WithFieldValue<T>) => data,
  fromFirestore: (snapshot: any) => snapshot.data() as T
});

const docWithConverter = <T>(firestore: Firestore, path: string) =>
  doc(firestore, path).withConverter(converter<T>());

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  private firestore: Firestore = inject(Firestore);

    private storage: Storage = inject(Storage); // Inyectar el servicio de Storage


  constructor(private http: HttpClient,private file: File,    private platform: Platform
) { }

  getFirestoreInstance(): Firestore {
    return this.firestore;
  }

  getDocument<T>(enlace: string): Promise<DocumentData> {
    const document = docWithConverter<T>(this.firestore, enlace);
    return getDoc(document);
  }

  getDocumentChanges<T>(enlace: string): Observable<T> {
    const document = docWithConverter<T>(this.firestore, enlace);
    return docData(document) as Observable<T>;
  }

  getCollectionChanges<T>(path: string): Observable<T[]> {
    const itemCollection = collection(this.firestore, path);
    return collectionData(itemCollection, { idField: 'id' }) as Observable<T[]>;
  }

  createDocument<T>(data: T, enlace: string): Promise<void> {
    const document = docWithConverter<T>(this.firestore, enlace);
    return setDoc(document, data);
  }

  async createDocumentWithAutoId<T>(data: T, enlace: string): Promise<void> {
    const itemCollection = collection(this.firestore, enlace);
    const newDocRef = doc(itemCollection).withConverter(converter<T>());
    await setDoc(newDocRef, data);
  }

  async updateDocument<T>(data: UpdateData<T>, enlace: string, idDoc: string): Promise<void> {
    const document = docWithConverter<T>(this.firestore, `${enlace}/${idDoc}`);
    return updateDoc(document, data);
  }

  deleteDocumentID(enlace: string, idDoc: string): Promise<void> {
    const document = doc(this.firestore, `${enlace}/${idDoc}`);
    return deleteDoc(document);
  }

  deleteDocFromRef(ref: DocumentReference): Promise<void> {
    return deleteDoc(ref);
  }

  createIdDoc(): string {
    return uuidv4();
  }

  async getAuthUser() {
    return { uid: '05OTLvPNICH5Gs9ZsW0k' };
  }

  async createUserWithSubcollections(userData: any, userId: string): Promise<void> {
    const userRef = doc(this.firestore, `Usuarios/${userId}`);
    await setDoc(userRef, userData);

    // Create subcollections
    const subcollections = ['certIngreso', 'declaracionJurada', 'facturacion', 'infoPersonal', 'planPago', 'AFIP', 'sueldos', 'f931'];
    for (const subcollection of subcollections) {
      const subcollectionRef = doc(collection(userRef, subcollection));
      await setDoc(subcollectionRef, { initialized: true }); // Puedes añadir datos por defecto aquí
    }
  }

  async getDocumentIdInSubcollection(path: string, subcollection: string): Promise<string | null> {
    const subcollectionRef = collection(this.firestore, `${path}/${subcollection}`);
    const querySnapshot = await getDocs(subcollectionRef);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];  // Suponiendo que solo hay un documento
      return doc.id;
    } else {
      return null;
    }
  }





  // categorias

  async createCategoria(categoria: Categoria): Promise<void> {
  const id = this.createIdDoc(); // Genera un id único
  categoria.fechaCreacion = new Date(); // Establece la fecha de creación
  await this.createDocument<Categoria>(categoria, `categorias/${id}`);
}


getCategorias(): Observable<Categoria[]> {
  return this.getCollectionChanges<Categoria>('categorias');
}


async updateCategoria(id: string, categoria: Partial<Categoria>): Promise<void> {
  await this.updateDocument<Categoria>(categoria, 'categorias', id);
}

async deleteCategoria(id: string): Promise<void> {
  await this.deleteDocumentID('categorias', id);
}




  // Obtener los APKs
  getApks(): Observable<Apk[]> {
    return this.getCollectionChanges<Apk>('apks');
  }



  // Eliminar un APK
  async deleteApk(id: string): Promise<void> {
    await this.deleteDocumentID('apks', id);
  }


async getApkById(id: string): Promise<Apk | undefined> {
  const apkDocRef = doc(this.firestore, 'apks', id);
  const apkDocSnap = await getDoc(apkDocRef);

  if (apkDocSnap.exists()) {
    return apkDocSnap.data() as Apk;
  } else {
    return undefined;
  }
}

// Obtener URL de descarga del APK
  getApkDownloadUrl(apkPath: string): Promise<string> {
    const apkRef = ref(this.storage, apkPath);
    return getDownloadURL(apkRef);
  }




 // Método para descargar el APK
  descargarAPK(apkUrl: string) {
    // Se crea un enlace invisible en la página para descargar el archivo
    const link = document.createElement('a');
    link.href = apkUrl;
    link.download = 'app.apk';  // Nombre del archivo APK
    link.click();  // Simula el clic para iniciar la descarga
  }

  
 // Obtener el documento del usuario
  public async getDocumentById<T>(collectionPath: string, documentId: string): Promise<DocumentData | undefined> {
    try {
      const docRef = doc(this.firestore, collectionPath, documentId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : undefined;
    } catch (error) {
      console.error("Error al obtener el documento:", error);
      throw error; // Relanza el error para manejarlo en el componente
    }
  }

  // Login del usuario basado en dni y password
  async loginUser(dni: string, password: string): Promise<UserI | undefined> {
    try {
      // Consulta a la colección Usuarios por el campo dni
      const userCollection = collection(this.firestore, 'Usuarios');
      const q = query(userCollection, where('dni', '==', dni));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const user = userDoc.data() as UserI;

        console.log('User found:', user);

        if(password === user.password){
          localStorage.setItem('userId', user.id);
          const validPassword = true
          console.log('Password comparison result:', validPassword);
          return user
        } else {
          return undefined
        }

      } else {
        console.log('No user found with given DNI');
        return undefined;
      }
    } catch (error) {
      console.error("Error al obtener credenciales del usuario:", error);
      throw error;
    }
  }

// Recuperar datos del usuario por ID
  async getUserData(userId: string): Promise<UserI | undefined> {
    try {
      const userDocRef = doc(this.firestore, `Usuarios/${userId}`).withConverter(converter<UserI>());
      const userDocSnap = await getDoc(userDocRef);
      return userDocSnap.exists() ? userDocSnap.data() : undefined;
    } catch (error) {
      console.error("Error al recuperar los datos del usuario:", error);
      throw error;
    }
  }
}







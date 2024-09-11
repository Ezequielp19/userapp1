import { Routes } from '@angular/router';

export const routes: Routes = [

   {
    path: 'login',
    loadComponent: () => import('../../src/app/views/login/login.page').then(m => m.LoginComponent)
  },
  {
    path: 'categorias',
    loadComponent: () => import('../../src/app/views/categorias/categorias.page').then(m => m.CategoriaPage)
  },
  {
    path: 'aplicaciones',
    loadComponent: () => import('../../src/app/views/apk/apk.component').then(m => m.ApkComponent)
  },
  {
    path: 'lista',
    loadComponent: () => import('../../src/app/views/apklist/apklist.component').then(m => m.ApkListComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('../../src/app/views/register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'home/:id',
    loadComponent: () => import('./home/home.page').then((m) => m.ApkListComponent),
  },
   {
    path: 'ver-usuario/:id',
    loadComponent: () => import('./views/ver-usuario/ver-usuario.component').then(m => m.VerUsuarioComponent)
  },
  {
    path: 'apk/:id',
    loadComponent: () => import('./home/home.page').then(m => m.ApkListComponent) // Ruta para detalle del APK
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];

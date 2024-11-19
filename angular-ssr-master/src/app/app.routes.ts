import { Routes } from '@angular/router';

import { HomeComponent } from './pages/general/home/home.component';
import { NotFoundComponent } from './pages/general/not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, },

  {
    path: 'bootstrap',
    loadChildren: () => import('./pages/application/example-bootstrap/tutorial.module')
      .then(mod => mod.TutorialModule)
  },
  {
    path: 'components',
    loadChildren: () => import('./pages/application/example-components/tutorial.module')
      .then(mod => mod.TutorialModule)
  },
  {
    path: 'forms',
    loadChildren: () => import('./pages/application/example-forms/tutorial.module')
      .then(mod => mod.TutorialModule)
  },
  {
    path: 'services',
    loadChildren: () => import('./pages/application/example-services/tutorial.module')
      .then(mod => mod.TutorialModule)
  },

  {
    path: 'login',
    loadChildren: () => import('./pages/general/login/login.module')
      .then(mod => mod.LoginModule)
  },
  {
    path: 'invoice',
    loadChildren: () => import('./pages/general/invoice/invoice.module')
      .then(mod => mod.InvoiceModule)
  },
  {
    path: 'afsinvoices',
    loadChildren: () => import('./pages/general/afsinvoices/afsinvoices.module')
      .then(mod => mod.afsInvoiceModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./pages/general/signup/signup.module')
      .then(mod => mod.SignupModule)
  },
  {
    path: 'contact',
    loadChildren: () => import('./pages/general/contact/contact.module')
      .then(mod => mod.ContactModule)
  },

  {
    path: 'about',
    loadChildren: () => import('./pages/general/about/about.routes').then(routes => routes.routes)
  },

  { path: '**', component: NotFoundComponent }
];
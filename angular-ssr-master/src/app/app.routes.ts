import { NgModule } from '@angular/core';
import { HomeComponent } from './pages/general/home/home.component';
import { NotFoundComponent } from './pages/general/not-found/not-found.component';
import { LoginComponent } from './pages/general/login/login.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { InvoiceComponent } from './pages/general/invoice/invoice.component';
import { AfsInvoicesComponent } from './pages/general/afsinvoices/afsinvoices.component';
import { SignupComponent } from './pages/general/signup/signup.component';
import { ContactComponent } from './pages/general/contact/contact.component';
import { AboutComponent } from './pages/general/about/about.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
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
  { path: 'about', component: AboutComponent },
  {
    path: 'invoice', component: InvoiceComponent, canActivate: [AuthGuard],
    loadChildren: () => import('./pages/general/invoice/invoice.module')
      .then(mod => mod.InvoiceModule)
  },
  {
    path: 'afsinvoices', component: AfsInvoicesComponent, canActivate: [AuthGuard],
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
  {
    path: 'afsinvoice',
    loadChildren: () => import('./pages/general/afsinvoice/afsinvoice.module').then(mod => mod.AfsinvoiceModule)
  },

  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})

export class AppRoutingModule { }
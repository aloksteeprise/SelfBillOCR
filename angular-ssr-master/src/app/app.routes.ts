import { NgModule } from '@angular/core';
import { HomeComponent } from './pages/general/home/home.component';
import { NotFoundComponent } from './pages/general/not-found/not-found.component';
import { LoginComponent } from './pages/general/login/login.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

import { AfsInvoicesComponent } from './pages/general/afsinvoices/afsinvoices.component';
import { SignupComponent } from './pages/general/signup/signup.component';
import { ContactComponent } from './pages/general/contact/contact.component';
import { AboutComponent } from './pages/general/about/about.component';
import { RemittancePopupComponent } from './pages/general/remittance-popup/remittance-popup.component';
import { RemittanceComponent } from './pages/general/remittance/remittance.component';
// import {RemittanceComponent} from './pages/general/remittance/remittance.component'
// import {InvoiceComponent} from './pages/general/invoice/invoice.component'
import {TransactionFormComponent} from './pages/general/transaction-form/transaction-form.component'
import {ManualAllocationPopupComponent} from './pages/general/manual-allocation-popup/manual-allocation-popup.component'
import {RemittanceAllocationComponent} from  './pages/general/remittance-allocation/remittance-allocation.component'

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'afsinvoices', component: AfsInvoicesComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
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
  {
    path: 'remittance', component: RemittanceComponent, canActivate: [AuthGuard],
    loadChildren: () => import('./pages/general/remittance/remittance.module')
      .then(mod => mod.RemittanceModule)
  },
  {
    path: 'transaction', component: TransactionFormComponent,
    loadChildren: () => import('./pages/general/transaction-form/transaction-form.module')
      .then(mod => mod.TransactionFormModule)
  },
  {
    path: 'remittancepop', component: RemittancePopupComponent, canActivate: [AuthGuard],
    loadChildren: () => import('./pages/general/remittance-popup/remittance-pop.module')
      .then(mod => mod.RemittancePopModule)
  },
  {
    path: 'remittanceallocation',
    loadChildren: () => import('./pages/general/remittance-allocation/remittance-allocation.module').then(mod => mod.RemittanceAllocationModule)
    },
  {
  path: 'afsselfbillnotification',
  loadChildren: () => import('./pages/general/afsselfbillnotification/afsselfbillnotification.module').then(mod => mod.AfsSelfBillNotificationModule)
  },
  {
    path: 'remittancenotification',
    loadChildren: () => import('./pages/general/remittancenotification/remittancenotification.module').then(mod => mod.RemittanceNotificationModule)
  },
  {
    path: 'manualallocation',component: ManualAllocationPopupComponent,
    loadChildren: () => import('./pages/general/manual-allocation-popup/manual-allocation-popup.module').then(mod => mod.ManualAllocationPopupModule)
  },

  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})

export class AppRoutingModule { }
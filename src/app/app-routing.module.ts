import { NgModule } from '@angular/core';
import { RouterModule, Routes, Route } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DrawingComponent } from './drawing/drawing.component';
import { MyDocumentComponent } from './dashboard/my-document/my-document.component';
import { HomeComponent } from './dashboard/home/home.component';
import { StarredDocumentComponent } from './dashboard/starred-document/starred-document.component';
import { SettingComponent } from './setting/setting.component';
import { UserprofileComponent } from './setting/userprofile/userprofile.component';
// import { UserSettingComponent } from './setting/user-setting/user-setting.component';
import { WorkspaceSettingComponent } from './setting/workspace-setting/workspace-setting.component';
import { ReferralOptionComponent } from './setting/referral-option/referral-option.component';
import { NotificationComponent } from './setting/notification/notification.component';
import { HelpOptionComponent } from './setting/help-option/help-option.component';
import { InviteLinkComponent } from './invite-link/invite-link.component';
import { UserAuthenGuard } from './guard/user-authen.guard';
import { ForgotPassowrdComponent } from './forgot-passowrd/forgot-passowrd.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { PortfolioDocumentComponent } from './dashboard/portfolio-document/portfolio-document.component';
import { SearchComponentComponent } from './dashboard/search-component/search-component.component';
import { SubscriptionPackagePlanComponent } from './subscription-package-plan/subscription-package-plan.component';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';
import { PaymentErrorComponent } from './payment-error/payment-error.component';
import { AdminSettingComponent } from './setting/admin-setting/admin-setting.component';
import { TemplatesComponent } from './dashboard/templates/templates.component';
import { BillingCycleComponent } from './setting/billing-cycle/billing-cycle.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'success/:id', component: PaymentSuccessComponent },
  { path: 'failure/:id', component: PaymentErrorComponent },

  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'my-portfolios', component: MyDocumentComponent },
      { path: 'favorite-document', component: StarredDocumentComponent },
      { path: 'portfolio-docs/:id', component: PortfolioDocumentComponent },
      { path: 'search-result', component: SearchComponentComponent },
      { path: 'templates', component: TemplatesComponent },
    ],
  },
  {
    path: 'setting',
    component: SettingComponent,
    children: [
      { path: '', redirectTo: 'user-profile', pathMatch: 'full' },
      { path: 'user-profile', component: UserprofileComponent },
      { path: 'admin-setting', component: AdminSettingComponent },
      { path: 'workspace-setting', component: WorkspaceSettingComponent },
      { path: 'referral-option', component: ReferralOptionComponent },
      { path: 'notification', component: NotificationComponent },
      { path: 'help-option', component: HelpOptionComponent },
      { path: 'subscription', component: SubscriptionPackagePlanComponent },
      { path: 'billing-cycle', component: BillingCycleComponent },
    ],
  },
  { path: 'drawing/:id', component: DrawingComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'invitations/accept/:viewId', component: InviteLinkComponent },
  { path: 'forgot-password', component: ForgotPassowrdComponent },
  { path: 'resetPassword', component: ResetPasswordComponent },
  { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

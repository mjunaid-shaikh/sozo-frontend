import { NgModule } from '@angular/core';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxMaskModule, IConfig } from 'ngx-mask';


import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DrawingComponent } from './drawing/drawing.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './dashboard/home/home.component';
import { MyDocumentComponent } from './dashboard/my-document/my-document.component';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { StarredDocumentComponent } from './dashboard/starred-document/starred-document.component';
import { SettingComponent } from './setting/setting.component';
import { UserprofileComponent } from './setting/userprofile/userprofile.component';
// import { UserSettingComponent } from './setting/user-setting/user-setting.component';
import { WorkspaceSettingComponent } from './setting/workspace-setting/workspace-setting.component';
import { ReferralOptionComponent } from './setting/referral-option/referral-option.component';
import { NotificationComponent } from './setting/notification/notification.component';
import { HelpOptionComponent } from './setting/help-option/help-option.component';
import { ModalComponent } from './modal/modal.component';
import { InviteLinkComponent } from './invite-link/invite-link.component';
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
import { ResizableModule } from "angular-resizable-element";

// import { CookieService } from "angular2-cookie/services/cookies.service";
// const config: SocketIoConfig = { url: 'http://18.218.110.26:8000/', options: {
//   transports:['websocket']
// } };

export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

@NgModule({
  declarations: [
    AppComponent,
    DrawingComponent,
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    HomeComponent,
    MyDocumentComponent,
    StarredDocumentComponent,
    SettingComponent,
    UserprofileComponent,
    // UserSettingComponent,
    WorkspaceSettingComponent,
    ReferralOptionComponent,
    NotificationComponent,
    HelpOptionComponent,
    ModalComponent,
    InviteLinkComponent,
    ForgotPassowrdComponent,
    ResetPasswordComponent,
    PortfolioDocumentComponent,
    SearchComponentComponent,
    AdminSettingComponent,
    SubscriptionPackagePlanComponent,

    PaymentSuccessComponent,

    PaymentErrorComponent,

    TemplatesComponent,

    BillingCycleComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    Ng2SearchPipeModule,
    NgxMaskModule.forRoot(),
    ResizableModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

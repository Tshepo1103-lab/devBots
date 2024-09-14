import { AppAuthService } from '@shared/auth/app-auth.service';
import { Component, ChangeDetectionStrategy, Injector, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/app-component-base';

@Component({
  selector: 'header-user-menu',
  templateUrl: './header-user-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderUserMenuComponent extends AppComponentBase implements OnInit {
  shownLoginName = '';

  constructor(injector: Injector, private _authService: AppAuthService) {
    super(injector);  // Pass the injector to the base class
  }

  ngOnInit(): void {
    // Initialize shownLoginName from appSession, just like in SidebarUserPanelComponent
    this.shownLoginName = this.appSession.getShownLoginName();
  }

  logout(): void {
    this._authService.logout();
  }
}

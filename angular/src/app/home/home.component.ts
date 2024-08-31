import { Component, Injector, ChangeDetectionStrategy } from '@angular/core';
import { AppComponentBase } from '@shared/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';

@Component({
  templateUrl: './home.component.html',
  animations: [appModuleAnimation()],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent extends AppComponentBase {
  dummyDataDailyHours = 10
  dummyDataWeeklyHours = 40
  dummyDataTotalHours = 1000
  dummyDataAverageHours = 50
  constructor(injector: Injector) {
    super(injector);
  }
}

import {
    Component,
    Injector,
    OnInit,
    EventEmitter,
    Output,
  } from '@angular/core';
  import { BsModalRef } from 'ngx-bootstrap/modal';
  import { AppComponentBase } from '@shared/app-component-base';
  import {
    TimeSheetDto,
    PermissionDto,
    CreateTimeSheetDto,
    PermissionDtoListResultDto,
    TimeSheetServiceProxy
  } from '@shared/service-proxies/service-proxies';
  import { forEach as _forEach, map as _map } from 'lodash-es';
import * as moment from 'moment';
  
  @Component({
    templateUrl: 'create-timesheet-dialog.component.html'
  })
  export class CreateTimeSheetDialogComponent extends AppComponentBase
    implements OnInit {
    saving = false;
    currentDate: string;
    timeSheet = new TimeSheetDto();
    permissions: PermissionDto[] = [];
    checkedPermissionsMap: { [key: string]: boolean } = {};
    defaultPermissionCheckedStatus = true;
  
    @Output() onSave = new EventEmitter<any>();
  
    constructor(
      injector: Injector,
      private _roleService: TimeSheetServiceProxy,
      public bsModalRef: BsModalRef
    ) {
      super(injector);
      this.currentDate = moment().format('YYYY-MM-DD');
    }
  
    ngOnInit(): void {
  
    }


    save(): void {
      this.saving = true;
  
      const role = new CreateTimeSheetDto();
      role.init({dateRecording:this.timeSheet.dateRecording,timelog:{numberOfHours:this.timeSheet.timelog}});
      this._roleService
        .create(role)
        .subscribe(
          () => {
            this.notify.info(this.l('SavedSuccessfully'));
            this.bsModalRef.hide();
            this.onSave.emit();
          },
          () => {
            this.saving = false;
          }
        );
    }
  }
  
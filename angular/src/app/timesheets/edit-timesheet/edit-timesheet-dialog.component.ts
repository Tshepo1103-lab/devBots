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
    TimeSheetServiceProxy,
    EditTimeSheetDto
  } from '@shared/service-proxies/service-proxies';
  import { forEach as _forEach, map as _map } from 'lodash-es';
import * as moment from 'moment';
  
  @Component({
    templateUrl: 'edit-timesheet-dialog.component.html'
  })
  export class EditTimeSheetDialogComponent extends AppComponentBase
    implements OnInit {
    saving = false;
    id: string;
    currentDate: string;
    timeSheet = new TimeSheetDto();
    numberOfHours:number;
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
        this._roleService
        .get(this.id)
        .subscribe((result: EditTimeSheetDto) => {
          this.timeSheet=result;
          this.timeSheet.timelog=result.timelog.numberOfHours;
          console.log('request',this.timeSheet)
        });
    }


    save(): void {
      this.saving = true;
      const role = new EditTimeSheetDto();
      console.log('--',this.timeSheet)
      console.log({id:this.timeSheet.id,dateRecording:this.timeSheet.dateRecording,timelog:{numberOfHours:this.timeSheet.timelog}})
      role.init({id:this.timeSheet.id,dateRecording:this.timeSheet.dateRecording,timelog:{numberOfHours:this.timeSheet.timelog}});
      console.log('role data',role)
      this._roleService
        .update(role)   
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
  
import { Component, Injector } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import {
  PagedListingComponentBase,
  PagedRequestDto
} from '@shared/paged-listing-component-base';
import {
  TimeSheetServiceProxy,
  TimeSheetDto,
  TimeSheetDtoPagedResultDto
} from '@shared/service-proxies/service-proxies';

import { CreateTimeSheetDialogComponent } from './create-timesheet/create-timesheet-dialog.component';

class PagedTimeSheetRequestDto extends PagedRequestDto {
  keyword: string;

}

@Component({
  templateUrl: './timesheet.component.html',
  animations: [appModuleAnimation()]
})
export class TimeSheetCompoment extends PagedListingComponentBase<TimeSheetDto>{
    constructor(
        injector: Injector,
        private _rolesService: TimeSheetServiceProxy,
        private _modalService: BsModalService
      ) {
        super(injector);
      }
    
    
    roles:TimeSheetDto[];
    pageSize = 5;
    pageNumber =1;
    totalItems=0;
    default:string;
    keyword: string;

    list(
        request: PagedTimeSheetRequestDto,
        pageNumber: number,
        finishedCallback: Function
      ): void {
        request.keyword = this.keyword;
    
        this._rolesService
          .getAll(request.keyword, request.skipCount, request.maxResultCount)
          .pipe(
            finalize(() => {
              finishedCallback();
            })
          )
          .subscribe((result: TimeSheetDtoPagedResultDto) => {
            this.roles = result.items;
            this.showPaging(result, pageNumber);
            console.log(result)
          });
      }
    
      delete(timesheet: TimeSheetDto): void {
        abp.message.confirm(
          this.l('TimeSheet Delete warning', timesheet.dateRecording),
          undefined,
          (result: boolean) => {
            if (result) {
              this._rolesService
                .delete(timesheet.id)
                .pipe(
                  finalize(() => {
                    abp.notify.success(this.l('SuccessfullyDeleted'));
                    this.refresh();
                  })
                )
                .subscribe(() => {});
            }
          }
        );
      }

    defaulter(): void {
        
    }
    createTimeSheet(): void {
      this.showCreateOrEditRoleDialog();
    }
    showCreateOrEditRoleDialog(id?: number): void {
        let createOrEditRoleDialog: BsModalRef;
        console.log('id',id)
        if (!id) {
          createOrEditRoleDialog = this._modalService.show(
            CreateTimeSheetDialogComponent,
            {
              class: 'modal-lg',
            }
          );
        } else {
          createOrEditRoleDialog = this._modalService.show(
            CreateTimeSheetDialogComponent,
            {
              class: 'modal-lg',
              initialState: {
               // id: id,
              },
            }
          );
        }
    
        createOrEditRoleDialog.content.onSave.subscribe(() => {
          this.refresh();
        });
    }
}

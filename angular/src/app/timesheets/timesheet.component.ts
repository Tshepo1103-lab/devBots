import { Component, Injector } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import {
  PagedListingComponentBase,
  PagedRequestDto
} from '@shared/paged-listing-component-base';
import {
  RoleServiceProxy,
  RoleDto,
  RoleDtoPagedResultDto
} from '@shared/service-proxies/service-proxies';

import { CreateTimeSheetDialogComponent } from './create-timesheet/create-timesheet-dialog.component';

class PagedTimeSheetRequestDto extends PagedRequestDto {
  keyword: string;

}

@Component({
  templateUrl: './timesheet.component.html',
  animations: [appModuleAnimation()]
})
export class TimeSheetCompoment extends PagedListingComponentBase<RoleDto>{
    constructor(
        injector: Injector,
        private _rolesService: RoleServiceProxy,
        private _modalService: BsModalService
      ) {
        super(injector);
      }
    
    
    roles:RoleDto[];
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
          .subscribe((result: RoleDtoPagedResultDto) => {
            this.roles = result.items;
            this.showPaging(result, pageNumber);
          });
      }
    
      delete(role: RoleDto): void {
        abp.message.confirm(
          this.l('RoleDeleteWarningMessage', role.displayName),
          undefined,
          (result: boolean) => {
            if (result) {
              this._rolesService
                .delete(role.id)
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

    showCreateOrEditRoleDialog(id?: number): void {
        let createOrEditRoleDialog: BsModalRef;
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

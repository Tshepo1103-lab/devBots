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
import { Observable } from 'rxjs';

import { CreateTimeSheetDialogComponent } from './create-timesheet/create-timesheet-dialog.component';
import { HttpClient, HttpHeaders, HttpResponse, HttpResponseBase } from '@angular/common/http';

class PagedTimeSheetRequestDto extends PagedRequestDto {
  keyword: string;

}

@Component({
  templateUrl: './timesheet.component.html',
  animations: [appModuleAnimation()],
  styleUrls: ["../../index.css", './timesheet.component.css']
})
export class TimeSheetCompoment extends PagedListingComponentBase<TimeSheetDto>{
  constructor(
    injector: Injector,
    private _rolesService: TimeSheetServiceProxy,
    private _modalService: BsModalService,
    private http: HttpClient
  ) {
    super(injector);
  }


  roles: TimeSheetDto[];
  pageSize = 5;
  pageNumber = 1;
  totalItems = 0;
  default: string;
  keyword: string;

  dailyStreak = 0
  totalHours = Number(0).toLocaleString()
  totalDays = Number(0).toLocaleString()

  ngOnInit(): void {
    this.getAllSumStats().subscribe((response: any) => {
      console.log(response)
      // Assuming response contains these fields
      this.dailyStreak = response.dailyStreak || "0";
      this.totalHours = Number(response.result.totalUserHours)?.toLocaleString() || "0.00";
      this.totalDays = Number(response.result.daysUserWorked).toLocaleString() || "0";
    });
  }

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
        console.log(result)
        this.roles = result.items;
        this.showPaging(result, pageNumber);
        console.log(result)
      });
  }

  //get sum stats start
  getAllSumStats(): Observable<any> {
    const url = 'https://localhost:44311/api/services/app/TimeSheet/GetAllSumStats';
    return this.http.get(url);
  }
  //get sum stats end

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
            .subscribe(() => { });
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
    console.log('id', id)
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

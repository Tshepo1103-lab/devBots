import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
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
import { EditTimeSheetDialogComponent } from './edit-timesheet/edit-timesheet-dialog.component';
import { Router } from '@angular/router'; 
import { Chart, registerables } from 'chart.js';
class PagedTimeSheetRequestDto extends PagedRequestDto {
  keyword: string;

}

@Component({
  templateUrl: './timesheet.component.html',
  animations: [appModuleAnimation()],
  styleUrls: ["../../index.css", './timesheet.component.css']
})
export class TimeSheetCompoment extends PagedListingComponentBase<TimeSheetDto>{
  periodStart: string; // Declare periodStart
  periodEnd: string;   // Declare periodEnd
  showGraph: boolean = false;
  @ViewChild('barChart') private chartRef: ElementRef;
  chart: any;
  hoursToday: string = Number(2).toLocaleString();
  hoursThisWeek: string = Number(10).toLocaleString();
  hoursThisMonth: string = Number(150).toLocaleString();
  hoursThisYear: string = Number(50000).toLocaleString(); 
  constructor(
        injector: Injector,
        private _rolesService: TimeSheetServiceProxy,
        private _modalService: BsModalService,
        private http: HttpClient,
        private router: Router
      ) {
        super(injector);
        Chart.register(...registerables); 
      }
    
      navigateToHomePage(): void {
        this.router.navigate(['/app/home']);
      }

    roles:TimeSheetDto[];
    pageSize = 5;
    pageNumber =1;
    totalItems=0;
    default:string;
    keyword: string;

  dailyStreak = 0
  totalHours = Number(0).toLocaleString()
  totalDays = Number(0).toLocaleString()

  toggleView(): void {
    this.showGraph = !this.showGraph;
    if (this.showGraph) {
      this.fetchChartData(); // Fetch data when switching to graph view
    }
  }
  ngOnInit(): void {
    this.getAllSumStats().subscribe((response: any) => {
      console.log(response)
      // Assuming response contains these fields
      this.dailyStreak = response.result.totalUserStreak || "0";
      this.totalHours = Number(response.result.totalUserHours)?.toLocaleString() || "0.00";
      this.totalDays = Number(response.result.daysUserWorked).toLocaleString() || "0";
    });

    this.periodEnd = new Date().toISOString();
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    this.periodStart = fourWeeksAgo.toISOString() // Set periodStart to today  
  }
  getAllSumStats(): Observable<any> {
    const url = 'https://localhost:44311/api/services/app/TimeSheet/GetAllSumStats';
    return this.http.get(url);
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
            this.roles = result.items;
            this.showPaging(result, pageNumber);
            console.log(result)
          });
      }
       fetchChartData() {
        console.log(this.periodStart, this.periodEnd)
        const apiUrl = `https://localhost:44311/api/services/app/TimeSheet/GetPeriodStats?periodStart=${new Date(this.periodStart).toISOString()}&periodEnd=${new Date(this.periodEnd).toISOString()}`;
    
        // Make the HTTP request
        this.http.get(apiUrl).subscribe(
          (response: any) => {
            const data = response.result; // Use the 'result' field from the API response
            this.createChart(data);
          },
          (error) => {
            console.error('Error fetching chart data', error);
          }
        );
      }
    
      createChart(data: any) {
        if (data && data.weeklyStats && data.weeklyStats.length > 0) {
          // Flatten all dailyStats from each week
          const allDailyStats = data.weeklyStats.reduce((acc, week) => {
            return acc.concat(week.dailyStats);
          }, []);
      
          // Extract labels and data
          const labels = allDailyStats.map(stat => new Date(stat.dateRecording).toLocaleDateString());
          const chartData = allDailyStats.map(stat =>
            stat.timeLogs.reduce((total, log) => total + log.numberOfHours, 0)
          );
      
          if (this.chartRef && this.chartRef.nativeElement) {
            const ctx = this.chartRef.nativeElement.getContext('2d');
            if (ctx) {
              if (this.chart) {
                this.chart.destroy(); // Destroy previous chart to prevent overlap
              }
      
              this.chart = new Chart(ctx, {
                type: 'bar',
                data: {
                  labels: labels,
                  datasets: [
                    {
                      label: 'Hours Worked',
                      data: chartData,
                      backgroundColor: 'rgba(75, 192, 192, 0.6)'
                    }
                  ]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false, // Allow custom size
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }
              });
            } else {
              console.error('Canvas context not found');
            }
          } else {
            console.error('Canvas element not found');
          }
        } else {
          console.error('Invalid data structure from API', data);
        }
      }
      
      
      exportToCSV(periodS: string = new Date(this.periodStart).toISOString(), periodE: string = new Date(this.periodEnd).toISOString()): void {
        const url = `https://localhost:44311/api/services/app/TimeSheet/ExportAsCSV?periodStart=${periodS}&periodEnd=${periodE}`; // URL to web api
        this.http.post(url, {}, { responseType: 'blob' as 'json' }).subscribe((response: Blob) => {
          const downloadUrl = window.URL.createObjectURL(response);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = 'Timesheet.csv';
          document.body.appendChild(link); // Append to body to ensure it works in all browsers
          link.click();
          document.body.removeChild(link); // Clean up
          window.URL.revokeObjectURL(downloadUrl);
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
    editTimeSheet(role: TimeSheetDto): void {
      this.showCreateOrEditRoleDialog(role.id);
    }

    createTimeSheet(): void {
      this.showCreateOrEditRoleDialog();
    }

    showCreateOrEditRoleDialog(id?: string): void {
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
            EditTimeSheetDialogComponent,
            {
              class: 'modal-lg',
              initialState: {
               id: id,
              },
            }
          );
        }
    
        createOrEditRoleDialog.content.onSave.subscribe(() => {
          this.refresh();
          this.getAllSumStats().subscribe((response: any) => {
            console.log(response)
            // Assuming response contains these fields
            this.dailyStreak = response.result.totalUserStreak || "0";
            this.totalHours = Number(response.result.totalUserHours)?.toLocaleString() || "0.00";
            this.totalDays = Number(response.result.daysUserWorked).toLocaleString() || "0";
          });
        });
    }
}

import { Component, Injector, ChangeDetectionStrategy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  templateUrl: './home.component.html',
  animations: [appModuleAnimation()],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent extends AppComponentBase implements AfterViewInit {
  @ViewChild('barChart') private chartRef: ElementRef;
  chart: any;

  constructor(injector: Injector) {
    super(injector);
  }

  ngAfterViewInit() {
    this.createChart();
  }

  createChart() {
    const dummyData = {
      periodStart: "2024-08-27T00:00:00",
      periodEnd: "2024-09-02T00:00:00",
      weeklyStats: [
        {
          weekStart: "2024-08-26T00:00:00",
          weekEnd: "2024-09-01T00:00:00",
          dailyStats: [
            {
              dateRecording: "2024-08-26T00:00:00",
              timeLogs: [{ numberOfHours: 10 }]
            },
            {
              dateRecording: "2024-08-24T00:00:00",
              timeLogs: [{ numberOfHours: 10 }]
            },
            {
              dateRecording: "2024-08-28T00:00:00",
              timeLogs: [{ numberOfHours: 1 }]
            },
            {
              dateRecording: "2024-08-29T00:00:00",
              timeLogs: [{ numberOfHours: 5 }]
            },
            {
              dateRecording: "2024-08-30T00:00:00",
              timeLogs: [{ numberOfHours: 10 }]
            },
            {
              dateRecording: "2024-08-31T00:00:00",
              timeLogs: [{ numberOfHours: 10 }]
            },
            {
              dateRecording: "2024-09-01T00:00:00",
              timeLogs: [{ numberOfHours: 15 }]
            }
          ]
        }
      ]
    };
  
    const labels = dummyData.weeklyStats[0].dailyStats.map(stat => 
      new Date(stat.dateRecording).toLocaleDateString()
    );
  
    const data = dummyData.weeklyStats[0].dailyStats.map(stat => 
      stat.timeLogs.reduce((total, log) => total + log.numberOfHours, 0)
    );
  
    if (this.chartRef && this.chartRef.nativeElement) {
      const ctx = this.chartRef.nativeElement.getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Hours Worked',
              data: data,
              backgroundColor: 'rgba(75, 192, 192, 0.6)'
            },
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    } else {
      console.error('Canvas element not found');
    }
  }
}  
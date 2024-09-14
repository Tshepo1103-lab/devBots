import { Component, Injector, ChangeDetectionStrategy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/app-component-base';
import { Chart, registerables } from 'chart.js';
import { SimpleCallsServiceProxy } from '@shared/services/simple-calls-service-proxy.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent extends AppComponentBase implements AfterViewInit {
  @ViewChild('barChart') private chartRef: ElementRef;
  chart: any;
  hoursToday: string = Number(2).toLocaleString();
  hoursThisWeek: string = Number(10).toLocaleString();
  hoursThisMonth: string = Number(150).toLocaleString();
  hoursThisYear: string = Number(50000).toLocaleString(); 

  constructor(injector: Injector, private simpleCallsService: SimpleCallsServiceProxy, private http: HttpClient) {
    super(injector);
    Chart.register(...registerables); // Registering chart.js components
  }

  ngAfterViewInit() {
    this.fetchChartData();
  }

  fetchChartData() {
    const apiUrl = 'https://localhost:44311/api/services/app/TimeSheet/GetPeriodStats?periodStart=2024-01-01&periodEnd=2024-10-10';

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
      const dailyStats = data.weeklyStats[0].dailyStats;

      // Extract labels (dates) and data (hours)
      const labels = dailyStats.map(stat => new Date(stat.dateRecording).toLocaleDateString());
      const chartData = dailyStats.map(stat => 
        stat.timeLogs.reduce((total, log) => total + log.numberOfHours, 0)
      );

      // Check if the chart reference is available and the canvas exists
      if (this.chartRef && this.chartRef.nativeElement) {
        const ctx = this.chartRef.nativeElement.getContext('2d');
        if (this.chart) {
          this.chart.destroy(); // Destroy previous chart to prevent overlap
        }

        // Create new chart
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
    } else {
      console.error('Invalid data structure from API');
    }
  }
}

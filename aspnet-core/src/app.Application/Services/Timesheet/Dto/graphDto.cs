using app.Domain;
using System;
using System.Collections.Generic;

namespace app.Services.Timesheet.Dto
{
    public class GraphDto
    {
        public class DayDto
        {
            public DateTime DateRecording { get; set; }
            public List<TimeLog> TimeLogs { get; set; } = new List<TimeLog>(); 
        }

        public class AllWeekStatsDto
        {
            public DateTime WeekStart { get; set; } 
            public DateTime WeekEnd { get; set; } 
            public List<DayDto> DailyStats { get; set; } = new List<DayDto>();
        }

        public class PeriodStatsDto
        {
            public DateTime PeriodStart { get; set; } 
            public DateTime PeriodEnd { get; set; } 
            public List<AllWeekStatsDto> WeeklyStats { get; set; } = new List<AllWeekStatsDto>(); 
        }
    }
}

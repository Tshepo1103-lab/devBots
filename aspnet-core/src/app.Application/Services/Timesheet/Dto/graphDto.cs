using app.Domain;
using app.Services.Timesheet.Dto.Read;
using System;
using System.Collections.Generic;

namespace app.Services.Timesheet.Dto
{
    public class GraphDto
    {
        public class DayDto
        {
            public DateTime DateRecording { get; set; }
            public List<TimeLogDto> TimeLogs { get; set; } = new List<TimeLogDto>(); 
        }

        public class AllWeekStatsDto
        {/*
            public DateTime WeekStart { get; set; } 
            public DateTime WeekEnd { get; set; } */
            public List<DayDto> DailyStats { get; set; } = new List<DayDto>();
        }

        public class PeriodStatsDto
        {
/*            public DateTime PeriodStart { get; set; } 
            public DateTime PeriodEnd { get; set; } */
            public List<AllWeekStatsDto> WeeklyStats { get; set; } = new List<AllWeekStatsDto>(); 
        }
    }
}

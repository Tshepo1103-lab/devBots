using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace app.Services.Timesheet.Dto.Read
{
    public class summaryDto
    {
        public int? TotalUserHours { get; set; }
        public long DaysUserWorked { get; set; }
        public int? TotalUserStreak { get; set; }
    }
}

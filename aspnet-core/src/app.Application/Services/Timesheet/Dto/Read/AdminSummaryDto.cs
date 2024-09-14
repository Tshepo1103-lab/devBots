using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace app.Services.Timesheet.Dto.Read
{
    public class AdminSummaryDto
    {
        public int? HoursDaily { get; set; }       
        public int? Hoursweekly { get; set; }
        public int? HoursMonthly { get; set; }
        public int? HoursYearly { get; set; }

    }
}

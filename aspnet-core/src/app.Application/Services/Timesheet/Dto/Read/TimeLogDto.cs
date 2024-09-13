using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace app.Services.Timesheet.Dto.Read
{
    /// <summary>
    /// 
    /// </summary>
    public class TimeLogDto: EntityDto<Guid>
    {
        public int? NumberOfHours { get; set; }
    }
}

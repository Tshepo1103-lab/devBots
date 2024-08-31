using Abp.Application.Services.Dto;
using app.Authorization.Users;
using app.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace app.Services.TimeSheets.Dto
{
    public class TImeSheetDto: EntityDto<Guid>
    {
        public User? User { get; set; }
        public TimeLog? TimeLog { get; set; }
        public DateTime? DateRecording { get; set; }
    }
}

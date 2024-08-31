using Abp.Domain.Entities.Auditing;
using app.Authorization.Users;
using System;

namespace app.Domain
{
    public class TimeSheet: FullAuditedEntity<Guid>
    {

        public User? User { get; set; }
        public TimeLog? TimeLog { get; set; }
        public DateTime? DateRecording { get; set; }
    }
}

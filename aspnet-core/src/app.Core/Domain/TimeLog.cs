using Abp.Domain.Entities.Auditing;
using System;

namespace app.Domain
{
    public class TimeLog : FullAuditedEntity<Guid>
    {
        public int? NumberOfHours { get; set; }
    }
}

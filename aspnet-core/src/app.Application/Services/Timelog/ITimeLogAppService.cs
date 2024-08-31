using Abp.Application.Services;
using Abp.Domain.Repositories;
using app.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace app.Services.Timelogs
{
    public interface ITimeLogAppService : IApplicationService
    {
        public Task<List<TimeLog>> GetAllAsync();
        public Task<TimeLog> GetAsync(Guid id);
        public Task<TimeLog> UpdateAsync(TimeLog input);
        public Task DeleteAsync(Guid id);
        public Task<TimeLog> CreateAsync(TimeLog input);
    }
}

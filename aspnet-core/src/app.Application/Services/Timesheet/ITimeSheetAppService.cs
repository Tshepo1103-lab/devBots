using Abp.Application.Services;
using Abp.Domain.Repositories;
using app.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace app.Services.TimeSheets
{
    public interface ITimeSheetAppService : IApplicationService
    {
        public Task<List<TimeSheet>> GetAllAsync();
        public Task<TimeSheet> GetAsync(Guid id);
        public Task<TimeSheet> UpdateAsync(TimeSheet input);
        public Task DeleteAsync(Guid id);
        public Task<TimeSheet> CreateAsync(TimeSheet input);
    }
}


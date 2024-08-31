using Abp.Application.Services;
using Abp.Authorization;
using Abp.Domain.Repositories;
using app.Authorization.Users;
using app.Domain;
using app.Services.Timelogs;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace app.Services.TimeSheets
{
    [AbpAuthorize]
    public class TimeSheetAppService : ApplicationService, ITimeSheetAppService
    {
        private readonly IRepository<TimeSheet, Guid> _timesheetRepository;
        private readonly UserManager _userManager;
        private readonly TimeLogAppService _timelogService;

        public TimeSheetAppService(IRepository<TimeSheet, Guid> timesheetRepository, UserManager userManager, TimeLogAppService timelogService)
        {
            _timesheetRepository = timesheetRepository;
            _userManager = userManager;
            _timelogService = timelogService;
        }

        /// <summary>
        ///  Get All the TimeSheet
        /// </summary>
        /// <returns></returns>
        public async Task<List<TimeSheet>> GetAllAsync() => await _timesheetRepository.GetAllIncluding(x=>x.User,x=>x.TimeLog)
                                                                                      .AsQueryable()
                                                                                      .Where(x=>x.User.Id==AbpSession.UserId).ToListAsync();

  

        /// <summary>
        /// Get TimeSheet by Id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<TimeSheet> GetAsync(Guid id)
        {
            return await _timesheetRepository.GetAsync(id);
        }

        /// <summary>
        /// Update TimeSheet
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public async Task<TimeSheet> UpdateAsync(TimeSheet input)
        {
            return await _timesheetRepository.UpdateAsync(input);
        }

        /// <summary>
        /// Delete TimeSheet using Id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task DeleteAsync(Guid id)
        {
            await _timesheetRepository.DeleteAsync(id);
        }

        /// <summary>
        /// Create TimeSheet
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public async Task<TimeSheet> CreateAsync(TimeSheet input)
        {
            input.User = _userManager.GetUserById((long)AbpSession.UserId);
            input.TimeLog = await _timelogService.CreateAsync(input.TimeLog);
            return await _timesheetRepository.InsertAsync(input);
        }
    }
}

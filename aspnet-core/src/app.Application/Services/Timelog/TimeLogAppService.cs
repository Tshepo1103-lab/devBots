using Abp.Application.Services;
using Abp.Authorization;
using Abp.Domain.Repositories;
using app.Authorization.Users;
using app.Domain;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace app.Services.Timelogs
{
    [AbpAuthorize]
    public class TimeLogAppService : ApplicationService, ITimeLogAppService
    {
        private readonly IRepository<TimeLog, Guid> _timelogRepository;
        private readonly UserManager _userManager;

        public TimeLogAppService(IRepository<TimeLog, Guid> timelogRepository)
        {
            _timelogRepository = timelogRepository;
        }

        /// <summary>
        ///  Get All the TimeLogs
        /// </summary>
        /// <returns></returns>
        public async Task<List<TimeLog>> GetAllAsync()
        {
            return await _timelogRepository.GetAllListAsync();
        }

        /// <summary>
        /// Get TimeLog by Id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<TimeLog> GetAsync(Guid id)
        {
            return await _timelogRepository.GetAsync(id);
        }

        /// <summary>
        /// Update TimeLog
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public async Task<TimeLog> UpdateAsync(TimeLog input)
        {
            return await _timelogRepository.UpdateAsync(input);
        }

        /// <summary>
        /// Delete TimeLog using Id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task DeleteAsync(Guid id)
        {
            await _timelogRepository.DeleteAsync(id);
        }

        public async Task<TimeLog> CreateAsync(TimeLog input)
        {
            return await _timelogRepository.InsertAsync(input);
        }
    }
}

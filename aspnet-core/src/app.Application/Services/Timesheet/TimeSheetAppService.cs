using Abp.Application.Services;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Extensions;
using app.Authorization.Users;
using app.Domain;
using app.Services.Timelogs;
using app.Services.Timesheet.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static app.Services.Timesheet.Dto.GraphDto;
using app.Services.Timesheet.Dto.Read;


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
        public async Task<List<TimeSheet>> GetAllAsync()
        {
            return await _timesheetRepository.GetAllIncluding(x => x.User, x => x.TimeLog).AsQueryable().Where(x => x.User.Id == AbpSession.UserId).ToListAsync();
        }

  

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


        [HttpGet]
        public async Task<PeriodStatsDto> GetPeriodStats(DateTime periodStart, DateTime periodEnd)
        {
            if (periodEnd < periodStart)
            {
                throw new ArgumentException("Period end date must be greater than start date.");
            }

            var timeSheets = await _timesheetRepository.GetAllIncluding(x => x.User, x => x.TimeLog)
                                                       .Where(x => x.User.Id == AbpSession.UserId && x.DateRecording >= periodStart && x.DateRecording <= periodEnd)
                                                       .OrderBy(x => x.DateRecording)
                                                       .ToListAsync();

            var weeklyStats = timeSheets.GroupBy(ts => new
            {
                WeekStart = ts.DateRecording.Value.StartOfWeek(DayOfWeek.Monday),
                WeekEnd = ts.DateRecording.Value.EndOfWeek(DayOfWeek.Monday)
            })
            .Select(weekGroup => new AllWeekStatsDto
            {
/*              WeekStart = weekGroup.Key.WeekStart,
                WeekEnd = weekGroup.Key.WeekEnd,*/
                DailyStats = weekGroup.GroupBy(ts => ts.DateRecording.Value.Date)
                                      .Select(dayGroup => new DayDto
                                      {
                                          DateRecording = dayGroup.Key,
                                          TimeLogs = new List<TimeLogDto>
                                          {
                                          new TimeLogDto
                                          {
                                              NumberOfHours = dayGroup.Sum(ts => ts.TimeLog.NumberOfHours),
                                          }
                                          }
                                      })
                                      .OrderBy(dayDto => dayDto.DateRecording)
                                      .ToList()
            }).ToList();

            var periodStats = new PeriodStatsDto
            {
                WeeklyStats = weeklyStats
            };

            return periodStats;
        }

        [HttpGet]
        public async Task<summaryDto> GetAllSumStats()
        {

            var timeSheets = await _timesheetRepository.GetAllIncluding(x => x.User, x => x.TimeLog)
                                                       .Where(x => x.User.Id == AbpSession.UserId)
                                                       .ToListAsync();

            var totalUserHours = timeSheets.Sum(ts => ts.TimeLog.NumberOfHours);
            var daysUserWorked = timeSheets.Count();

            return new summaryDto
            {
                TotalUserHours = totalUserHours,
                DaysUserWorked = daysUserWorked
            };
        }



    }
}

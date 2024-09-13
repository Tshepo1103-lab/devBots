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
using System.Text;
using System.IO;


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

            // Fetch the most recent timesheet record for the current user from yesterday
            var yesterday = DateTime.Now.AddDays(-1).Date;

            // Remove x.Streak from Include, as it's not a navigation property
            var lastStreakRecord = _timesheetRepository.GetAllIncluding(x => x.User)
                .Where(x => x.User.Id == AbpSession.UserId && x.DateRecording.Value.Date == yesterday)
                .OrderByDescending(x => x.DateRecording)
                .FirstOrDefault();

            if (lastStreakRecord == null || lastStreakRecord.Streak == null)
            {
                // No streak from yesterday, reset streak
                input.Streak = 1;
            }
            else
            {
                // Continue the streak
                input.Streak = lastStreakRecord.Streak + 1;
            }

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
            var latestUserStreak = timeSheets.Last().Streak;


            return new summaryDto
            {
                TotalUserHours = totalUserHours,
                DaysUserWorked = daysUserWorked,
                TotalUserStreak = latestUserStreak
            };
        }

        public async Task<FileStreamResult> ExportAsCSV(DateTime periodStart, DateTime periodEnd)
        {
            var periodStats = await GetPeriodStats(periodStart, periodEnd);
            var userName = _userManager.GetUserById((long)AbpSession.UserId).UserName;
            var csv = new StringBuilder();
            csv.AppendLine("Week Start,Week End,Day,Hours");

            foreach (var weekStats in periodStats.WeeklyStats)
            {
                foreach (var dayStats in weekStats.DailyStats)
                {
                    csv.AppendLine($"{weekStats.WeekStart},{weekStats.WeekEnd},{dayStats.DateRecording},{dayStats.TimeLogs.Sum(tl => tl.NumberOfHours)}");
                }
            }

            var stream = new MemoryStream();
            var writer = new StreamWriter(stream);
            writer.Write(csv.ToString());
            writer.Flush();
            stream.Position = 0;

            return new FileStreamResult(stream, "text/csv") { FileDownloadName = $"{userName}.csv" };
        }



    }
}

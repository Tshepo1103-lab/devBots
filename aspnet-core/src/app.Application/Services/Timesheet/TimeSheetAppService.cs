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
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using static app.Services.Timesheet.Dto.GraphDto;
using app.Services.Timesheet.Dto.Read;
using System.Text;
using System.IO;
using app.Authorization.Roles;
using app.Users.Dto;
using Microsoft.AspNetCore.Identity;
using Abp.UI;


namespace app.Services.TimeSheets
{
    [AbpAuthorize]
    public class TimeSheetAppService : ApplicationService, ITimeSheetAppService
    {
        private readonly IRepository<User, long> _userRepository;
        private readonly IRepository<TimeSheet, Guid> _timesheetRepository;
        private readonly UserManager _userManager;
        private readonly TimeLogAppService _timelogService;

        public TimeSheetAppService(IRepository<User, long> userRepository,IRepository<TimeSheet, Guid> timesheetRepository, UserManager userManager, TimeLogAppService timelogService)
        {
            _userRepository = userRepository;
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
            return await _timesheetRepository.GetAllIncluding(x=>x.TimeLog).Where(x=>x.Id == id).FirstAsync();
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
            var userId = (long)AbpSession.UserId;
            input.User = _userManager.GetUserById(userId);

            // Get the date for which the timesheet is being recorded
            var timesheetDate = input.DateRecording.HasValue ? input.DateRecording.Value.Date : DateTime.Now.Date;

            // Only apply the 24-hour rule if the timesheet is for today
            if (timesheetDate == DateTime.Now.Date)
            {
                // Fetch today's timesheets for the current user
                var todaysTimeSheets = await _timesheetRepository.GetAllIncluding(x => x.User, x => x.TimeLog)
                                                                 .Where(x => x.User.Id == userId && x.DateRecording.Value.Date == timesheetDate)
                                                                 .ToListAsync();

                // Calculate the total hours logged today
                var totalHoursToday = todaysTimeSheets.Sum(ts => ts.TimeLog.NumberOfHours);

                // Check if the total hours exceed 24
                if (totalHoursToday + input.TimeLog.NumberOfHours > 24)
                {
                    throw new UserFriendlyException("Total logged hours for today cannot exceed 24 hours.");
                }
            }

            // Proceed with creating the timesheet
            input.TimeLog = await _timelogService.CreateAsync(input.TimeLog);

            // Fetch the most recent timesheet record for the current user from yesterday
            var yesterday = DateTime.Now.AddDays(-1).Date;
            var lastStreakRecord = _timesheetRepository.GetAllIncluding(x => x.User)
                .Where(x => x.User.Id == userId && x.DateRecording.Value.Date == yesterday)
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


        /// <summary>
        /// Gets all users in the system.
        /// </summary>
        /// <returns>A list of users.</returns>
        [HttpGet]
        public async Task<List<UserDto>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllListAsync();
            var userDtos = new List<UserDto>();
            foreach (var user in users)
            {
                var userDto = new UserDto()
                {
                    Id = user.Id,
                    UserName = user.UserName,
                };
                userDtos.Add(userDto);
            }
            return userDtos;
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
            var distinctDaysWorked = timeSheets.GroupBy(ts => ts.DateRecording.Value.Date)
                                     .Count();
            var latestUserStreak = timeSheets.Last().Streak;


            return new summaryDto
            {
                TotalUserHours = totalUserHours,
                DaysUserWorked = distinctDaysWorked,
                TotalUserStreak = latestUserStreak
            };
        }

        [HttpGet]
        public async Task<AdminSummaryDto> GetAllAdminSumStats()
        {

            var timeSheets = _timesheetRepository.GetAllIncluding( x => x.TimeLog)                                         
                                                       .AsQueryable();

            var hoursDaily = await timeSheets.Where(ts => ts.DateRecording.Value.Date == DateTime.Now.Date).SumAsync(x=>x.TimeLog.NumberOfHours);
            var hoursweekly = await timeSheets.Where(ts => ts.DateRecording.Value.Date > DateTime.Now.AddDays(-7) && ts.DateRecording.Value.Date <= DateTime.Now.Date).SumAsync(x => x.TimeLog.NumberOfHours);
            var hoursMonthly = await timeSheets.Where(ts => ts.DateRecording.Value.Month == DateTime.Now.Month).SumAsync(x => x.TimeLog.NumberOfHours);
            var hoursYearly = await timeSheets.Where(ts => ts.DateRecording.Value.Year == DateTime.Now.Year).SumAsync(x => x.TimeLog.NumberOfHours);

            return new AdminSummaryDto
            {
                HoursDaily = hoursDaily,
                Hoursweekly = hoursweekly,
                HoursMonthly = hoursMonthly,
                HoursYearly = hoursYearly
            };
        }
        [HttpPost]
        public async Task<FileStreamResult> ExportAsCSV(DateTime periodStart, DateTime periodEnd)
        {
            var periodStats = await GetPeriodStats(periodStart, periodEnd);
            var userName = _userManager.GetUserById((long)AbpSession.UserId).UserName;

            // Start building the CSV with a nice title
            var csv = new StringBuilder();

            // Add a title for the report
            csv.AppendLine("Timesheet Report");

            // Add the date range for the report under the title
            csv.AppendLine($"Report Period: {periodStart:yyyy-MM-dd} to {periodEnd:yyyy-MM-dd}");

            // Add a blank line for separation before the data
            csv.AppendLine();

            // Add column headers
            csv.AppendLine("Day,Hours");

            // Append the data
            foreach (var weekStats in periodStats.WeeklyStats)
            {
                foreach (var dayStats in weekStats.DailyStats)
                {
                    csv.AppendLine($"{dayStats.DateRecording:yyyy-MM-dd},{dayStats.TimeLogs.Sum(tl => tl.NumberOfHours)}");
                }
            }

            var stream = new MemoryStream();
            var writer = new StreamWriter(stream);
            writer.Write(csv.ToString());
            writer.Flush();
            stream.Position = 0;

            // Return the CSV file with a custom file name
            return new FileStreamResult(stream, "text/csv") { FileDownloadName = $"{userName}_TimesheetReport_{DateTime.Now:yyyyMMdd}.csv" };
        }


    }
}

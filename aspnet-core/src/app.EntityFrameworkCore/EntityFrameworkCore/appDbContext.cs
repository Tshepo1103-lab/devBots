using Microsoft.EntityFrameworkCore;
using Abp.Zero.EntityFrameworkCore;
using app.Authorization.Roles;
using app.Authorization.Users;
using app.MultiTenancy;
using app.Domain;

namespace app.EntityFrameworkCore
{
    public class appDbContext : AbpZeroDbContext<Tenant, Role, User, appDbContext>
    {
        /* Define a DbSet for each entity of the application */
        public DbSet<TimeLog> TimeLogs { get; set; }
        public DbSet<TimeSheet> TimeSheets { get; set; }

        public appDbContext(DbContextOptions<appDbContext> options)
            : base(options)
        {
        }
    }
}

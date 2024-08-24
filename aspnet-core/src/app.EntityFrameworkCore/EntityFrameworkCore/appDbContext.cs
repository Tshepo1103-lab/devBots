using Microsoft.EntityFrameworkCore;
using Abp.Zero.EntityFrameworkCore;
using app.Authorization.Roles;
using app.Authorization.Users;
using app.MultiTenancy;

namespace app.EntityFrameworkCore
{
    public class appDbContext : AbpZeroDbContext<Tenant, Role, User, appDbContext>
    {
        /* Define a DbSet for each entity of the application */
        
        public appDbContext(DbContextOptions<appDbContext> options)
            : base(options)
        {
        }
    }
}

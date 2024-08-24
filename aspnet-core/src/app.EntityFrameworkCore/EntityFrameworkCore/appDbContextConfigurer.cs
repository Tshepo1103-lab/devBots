using System.Data.Common;
using Microsoft.EntityFrameworkCore;

namespace app.EntityFrameworkCore
{
    public static class appDbContextConfigurer
    {
        public static void Configure(DbContextOptionsBuilder<appDbContext> builder, string connectionString)
        {
            builder.UseSqlServer(connectionString);
        }

        public static void Configure(DbContextOptionsBuilder<appDbContext> builder, DbConnection connection)
        {
            builder.UseSqlServer(connection);
        }
    }
}

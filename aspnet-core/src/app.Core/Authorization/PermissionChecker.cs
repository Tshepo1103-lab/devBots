using Abp.Authorization;
using app.Authorization.Roles;
using app.Authorization.Users;

namespace app.Authorization
{
    public class PermissionChecker : PermissionChecker<Role, User>
    {
        public PermissionChecker(UserManager userManager)
            : base(userManager)
        {
        }
    }
}

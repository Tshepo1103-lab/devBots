using System.Threading.Tasks;
using Abp.Authorization;
using Abp.Runtime.Session;
using app.Configuration.Dto;

namespace app.Configuration
{
    [AbpAuthorize]
    public class ConfigurationAppService : appAppServiceBase, IConfigurationAppService
    {
        public async Task ChangeUiTheme(ChangeUiThemeInput input)
        {
            await SettingManager.ChangeSettingForUserAsync(AbpSession.ToUserIdentifier(), AppSettingNames.UiTheme, input.Theme);
        }
    }
}

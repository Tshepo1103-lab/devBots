using System.Threading.Tasks;
using app.Configuration.Dto;

namespace app.Configuration
{
    public interface IConfigurationAppService
    {
        Task ChangeUiTheme(ChangeUiThemeInput input);
    }
}

using System.Threading.Tasks;
using Abp.Application.Services;
using app.Sessions.Dto;

namespace app.Sessions
{
    public interface ISessionAppService : IApplicationService
    {
        Task<GetCurrentLoginInformationsOutput> GetCurrentLoginInformations();
    }
}

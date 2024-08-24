using System.Threading.Tasks;
using app.Models.TokenAuth;
using app.Web.Controllers;
using Shouldly;
using Xunit;

namespace app.Web.Tests.Controllers
{
    public class HomeController_Tests: appWebTestBase
    {
        [Fact]
        public async Task Index_Test()
        {
            await AuthenticateAsync(null, new AuthenticateModel
            {
                UserNameOrEmailAddress = "admin",
                Password = "123qwe"
            });

            //Act
            var response = await GetResponseAsStringAsync(
                GetUrl<HomeController>(nameof(HomeController.Index))
            );

            //Assert
            response.ShouldNotBeNullOrEmpty();
        }
    }
}
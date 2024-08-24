using Abp.AutoMapper;
using Abp.Modules;
using Abp.Reflection.Extensions;
using app.Authorization;

namespace app
{
    [DependsOn(
        typeof(appCoreModule), 
        typeof(AbpAutoMapperModule))]
    public class appApplicationModule : AbpModule
    {
        public override void PreInitialize()
        {
            Configuration.Authorization.Providers.Add<appAuthorizationProvider>();
        }

        public override void Initialize()
        {
            var thisAssembly = typeof(appApplicationModule).GetAssembly();

            IocManager.RegisterAssemblyByConvention(thisAssembly);

            Configuration.Modules.AbpAutoMapper().Configurators.Add(
                // Scan the assembly for classes which inherit from AutoMapper.Profile
                cfg => cfg.AddMaps(thisAssembly)
            );
        }
    }
}

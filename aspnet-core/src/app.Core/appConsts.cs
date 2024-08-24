using app.Debugging;

namespace app
{
    public class appConsts
    {
        public const string LocalizationSourceName = "app";

        public const string ConnectionStringName = "Default";

        public const bool MultiTenancyEnabled = true;


        /// <summary>
        /// Default pass phrase for SimpleStringCipher decrypt/encrypt operations
        /// </summary>
        public static readonly string DefaultPassPhrase =
            DebugHelper.IsDebug ? "gsKxGZ012HLL3MI5" : "42a1996a18ac442f8c2751c44db80b0b";
    }
}

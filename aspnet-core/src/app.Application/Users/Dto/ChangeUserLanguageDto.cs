using System.ComponentModel.DataAnnotations;

namespace app.Users.Dto
{
    public class ChangeUserLanguageDto
    {
        [Required]
        public string LanguageName { get; set; }
    }
}
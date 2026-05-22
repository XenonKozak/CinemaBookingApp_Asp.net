using System.Threading.Tasks;

namespace CinemaBookingApp2.Interfaces
{
    public interface IEmailSender
    {
        Task SendEmailAsync(string email, string subject, string message);
    }
}

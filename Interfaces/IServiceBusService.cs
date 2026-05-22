using System.Threading.Tasks;

namespace CinemaBookingApp2.Interfaces
{
    public interface IServiceBusService
    {
        Task SendMessageAsync<T>(T serviceBusMessage, string queueName);
    }
}

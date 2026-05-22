using Azure.Messaging.ServiceBus;
using CinemaBookingApp2.Configurations;
using CinemaBookingApp2.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using System.Threading.Tasks;

namespace CinemaBookingApp2.Services
{
    public class ServiceBusService : IServiceBusService
    {
        private readonly ServiceBusClient? _client;

        public ServiceBusService(IConfiguration configuration)
        {
            if (ServiceBusConfig.IsEnabled(configuration))
            {
                _client = new ServiceBusClient(configuration.GetConnectionString("ServiceBus"));
            }
        }

        public async Task SendMessageAsync<T>(T serviceBusMessage, string queueName)
        {
            if (_client == null) return;

            try
            {
                var sender = _client.CreateSender(queueName);
                var messageBody = JsonSerializer.Serialize(serviceBusMessage);
                var message = new ServiceBusMessage(messageBody);

                await sender.SendMessageAsync(message);
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine($"[ServiceBus Error] Nie udało się wysłać wiadomości do kolejki {queueName}: {ex.Message}");
            }
        }
    }
}

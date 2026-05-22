using Azure.Messaging.ServiceBus;
using CinemaBookingApp2.Configurations;
using CinemaBookingApp2.DTOs.ServiceBusDTOs;
using CinemaBookingApp2.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace CinemaBookingApp2.Workers
{
    public class UserRegistrationEmailWorker : BackgroundService
    {
        private readonly IConfiguration _configuration;
        private readonly IEmailSender _emailSender;
        private ServiceBusClient _client;
        private ServiceBusProcessor _processor;

        public UserRegistrationEmailWorker(IConfiguration configuration, IEmailSender emailSender)
        {
            _configuration = configuration;
            _emailSender = emailSender;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (!ServiceBusConfig.IsEnabled(_configuration))
            {
                Console.WriteLine("[ServiceBus Worker] Kolejka 'user-events' wyłączona (brak poprawnego Service Bus w konfiguracji).");
                return;
            }

            var connectionString = _configuration.GetConnectionString("ServiceBus")!;
            _client = new ServiceBusClient(connectionString);
            _processor = _client.CreateProcessor("user-events", new ServiceBusProcessorOptions());

            _processor.ProcessMessageAsync += MessageHandler;
            _processor.ProcessErrorAsync += ErrorHandler;

            await _processor.StartProcessingAsync(stoppingToken);

            // Wait indefinitely until cancellation is requested
            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(1000, stoppingToken);
            }

            await _processor.StopProcessingAsync(stoppingToken);
            await _processor.CloseAsync(stoppingToken);
        }

        private async Task MessageHandler(ProcessMessageEventArgs args)
        {
            try
            {
                var body = args.Message.Body.ToString();
                var userMessage = JsonSerializer.Deserialize<UserCreatedMessageDto>(body);

                if (userMessage != null)
                {
                    Console.WriteLine($"[ServiceBus Worker] Otrzymano zdarzenie o nowym użytkowniku: {userMessage.Email}");

                    var emailSubject = "Witamy w Cinema Booking App!";
                    var emailBody = $@"
                        <h3>Witaj {userMessage.UserName}!</h3>
                        <p>Cieszymy się, że dołączyłeś do naszej aplikacji. Od teraz możesz swobodnie rezerwować bilety na najlepsze seanse filmowe.</p>
                        <br>
                        <p>Pozdrawiamy,</p>
                        <p>Zespół Cinema Booking App</p>";

                    await _emailSender.SendEmailAsync(userMessage.Email, emailSubject, emailBody);
                }

                // Complete the message. Messages are deleted from the queue.
                await args.CompleteMessageAsync(args.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ServiceBus Worker] Błąd przetwarzania wiadomości: {ex.Message}");
                // If it fails, the message will naturally reappear in the queue for a retry
            }
        }

        private Task ErrorHandler(ProcessErrorEventArgs args)
        {
            Console.WriteLine($"[ServiceBus Worker] Wykryto błąd na kolejce 'user-events': {args.Exception.Message}");
            return Task.CompletedTask;
        }

        public override async Task StopAsync(CancellationToken stoppingToken)
        {
            if (_processor != null)
            {
                await _processor.StopProcessingAsync(stoppingToken);
                await _processor.DisposeAsync();
            }
            
            if (_client != null)
            {
                await _client.DisposeAsync();
            }

            await base.StopAsync(stoppingToken);
        }
    }
}

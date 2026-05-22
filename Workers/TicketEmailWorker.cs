using Azure.Messaging.ServiceBus;
using CinemaBookingApp2.DTOs.ServiceBusDTOs;
using CinemaBookingApp2.Interfaces;
using CinemaBookingApp2.Db;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace CinemaBookingApp2.Workers
{
    public class TicketEmailWorker : BackgroundService
    {
        private readonly IConfiguration _configuration;
        private readonly IServiceProvider _serviceProvider;
        private readonly IEmailSender _emailSender;
        private ServiceBusClient? _client;
        private ServiceBusProcessor? _processor;

        public TicketEmailWorker(IConfiguration configuration, IServiceProvider serviceProvider, IEmailSender emailSender)
        {
            _configuration = configuration;
            _serviceProvider = serviceProvider;
            _emailSender = emailSender;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var connectionString = _configuration.GetConnectionString("ServiceBus");
            
            if (string.IsNullOrEmpty(connectionString)) return;

            _client = new ServiceBusClient(connectionString);
            _processor = _client.CreateProcessor("ticket-queue", new ServiceBusProcessorOptions());

            _processor.ProcessMessageAsync += MessageHandler;
            _processor.ProcessErrorAsync += ErrorHandler;

            await _processor.StartProcessingAsync(stoppingToken);

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
                var ticketMessage = JsonSerializer.Deserialize<TicketMessageDto>(body);

                if (ticketMessage != null)
                {
                    Console.WriteLine($"[ServiceBus Worker] Otrzymano zdarzenie o rezerwacji: {ticketMessage.ReservationId}");

                    // Rezolwujemy DbContext w zakresie (scope), jako że DbContext jest Scoped, a Worker jest Singletonem
                    using var scope = _serviceProvider.CreateScope();
                    var context = scope.ServiceProvider.GetRequiredService<ReservationContext>();

                    var user = await context.Users.FindAsync(ticketMessage.UserId);
                    var screening = await context.Screenings.Include(s => s.Movie).FirstOrDefaultAsync(s => s.Id == ticketMessage.ScreeningId);

                    if (user != null && screening != null && screening.Movie != null)
                    {
                        var emailSubject = $"Twój bilet na film: {screening.Movie.Title}!";
                        var emailBody = $@"
                            <h3>Witaj {user.UserName}!</h3>
                            <p>Dziękujemy za dokonanie rezerwacji w naszym kinie.</p>
                            <hr>
                            <h4>Szczegóły Twojego biletu:</h4>
                            <ul>
                                <li><strong>Film:</strong> {screening.Movie.Title}</li>
                                <li><strong>Rząd:</strong> {ticketMessage.Row}</li>
                                <li><strong>Miejsce:</strong> {ticketMessage.SeatNumber}</li>
                                <li><strong>Data seansu:</strong> {ticketMessage.ReservationDate:dd.MM.yyyy HH:mm}</li>
                                <li><strong>Kod rezerwacji:</strong> {ticketMessage.ReservationId}</li>
                            </ul>
                            <br>
                            <p>Życzymy udanego seansu!</p>
                            <p>Zespół Cinema Booking App</p>";

                        await _emailSender.SendEmailAsync(user.Email, emailSubject, emailBody);
                        Console.WriteLine($"[ServiceBus Worker] Wysłano e-mail z biletem do {user.Email} na film {screening.Movie.Title}");
                    }
                    else
                    {
                        Console.WriteLine($"[ServiceBus Worker] Nie znaleziono użytkownika lub seansu dla rezerwacji {ticketMessage.ReservationId}");
                    }
                }

                await args.CompleteMessageAsync(args.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ServiceBus Worker] Błąd przetwarzania wiadomości biletu: {ex.Message}");
            }
        }

        private Task ErrorHandler(ProcessErrorEventArgs args)
        {
            Console.WriteLine($"[ServiceBus Worker] Wykryto błąd na kolejce 'ticket-queue': {args.Exception.Message}");
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

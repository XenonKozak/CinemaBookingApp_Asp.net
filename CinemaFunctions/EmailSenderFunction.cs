using System;
using System.Net;
using System.Net.Mail;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace CinemaFunctions
{
    public class UserCreatedMessageDto
    {
        public Guid UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
    }

    public class EmailSenderFunction
    {
        private readonly ILogger<EmailSenderFunction> _logger;

        public EmailSenderFunction(ILogger<EmailSenderFunction> logger)
        {
            _logger = logger;
        }

        [Function("EmailSenderFunction")]
        public async Task Run([ServiceBusTrigger("user-events", Connection = "ServiceBusConnection")] string myQueueItem)
        {
            _logger.LogInformation("Otrzymano wiadomość z kolejki Service Bus.");

            try
            {
                var userMessage = JsonSerializer.Deserialize<UserCreatedMessageDto>(myQueueItem);
                
                if (userMessage != null)
                {
                    _logger.LogInformation($"Wysyłanie e-maila powitalnego do: {userMessage.Email}");
                    
                    var emailSubject = "Witamy w Cinema Booking App!";
                    var emailBody = $@"
                        <h3>Witaj {userMessage.UserName}!</h3>
                        <p>Cieszymy się, że dołączyłeś do naszej aplikacji. Od teraz możesz swobodnie rezerwować bilety na najlepsze seanse filmowe.</p>
                        <br>
                        <p>Pozdrawiamy,</p>
                        <p>Zespół Cinema Booking App</p>";

                    var host = Environment.GetEnvironmentVariable("SmtpHost") ?? "smtp.gmail.com";
                    var portStr = Environment.GetEnvironmentVariable("SmtpPort") ?? "587";
                    var port = int.Parse(portStr);
                    var username = Environment.GetEnvironmentVariable("SmtpUsername");
                    var password = Environment.GetEnvironmentVariable("SmtpPassword");

                    if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password) || username == "TWÓJ_EMAIL@gmail.com")
                    {
                        _logger.LogWarning("Brak danych SMTP. E-mail nie zostanie wysłany.");
                        return;
                    }

                    using var client = new SmtpClient(host, port)
                    {
                        EnableSsl = true,
                        UseDefaultCredentials = false,
                        Credentials = new NetworkCredential(username, password)
                    };

                    var mailMessage = new MailMessage
                    {
                        From = new MailAddress(username, "Cinema Booking App"),
                        Subject = emailSubject,
                        Body = emailBody,
                        IsBodyHtml = true,
                    };
                    mailMessage.To.Add(userMessage.Email);

                    await client.SendMailAsync(mailMessage);
                    _logger.LogInformation("E-mail powitalny został pomyślnie wysłany.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Błąd podczas wysyłania e-maila: {ex.Message}");
                throw; 
            }
        }
    }
}

using CinemaBookingApp2.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace CinemaBookingApp2.Services
{
    public class SmtpEmailSenderService : IEmailSender
    {
        private readonly IConfiguration _configuration;

        public SmtpEmailSenderService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string email, string subject, string message)
        {
            var host = _configuration["SmtpSettings:Host"];
            var port = int.Parse(_configuration["SmtpSettings:Port"] ?? "587");
            var username = _configuration["SmtpSettings:Username"];
            var password = _configuration["SmtpSettings:Password"];

            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password) || username == "TWÓJ_EMAIL@gmail.com")
            {
                Console.WriteLine($"[Email System] Pominęto wysyłkę e-maila do {email}. Uzupełnij dane SMTP w appsettings.json.");
                return;
            }

            var client = new SmtpClient(host, port)
            {
                EnableSsl = true,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(username, password)
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(username, "Cinema Booking App"),
                Subject = subject,
                Body = message,
                IsBodyHtml = true,
            };

            mailMessage.To.Add(email);

            await client.SendMailAsync(mailMessage);
            Console.WriteLine($"[Email System] Wysłano powitalny e-mail do: {email}");
        }
    }
}

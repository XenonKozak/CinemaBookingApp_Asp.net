
using System.Text;
using CinemaBookingApp2.Configurations;
using CinemaBookingApp2.Db;
using CinemaBookingApp2.Interfaces;
using CinemaBookingApp2.Models;
using CinemaBookingApp2.Services;
using CinemaBookingApp2.Workers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Azure.Storage.Blobs;
namespace CinemaBookingApp2
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
            builder.Services.AddDbContext<ReservationContext>
                (options => options.UseSqlServer(connectionString));

            // Konfiguracja Redis Cache lub wbudowanego Memory Cache
            var useRedis = builder.Configuration.GetValue<bool>("UseRedis", true);
            var redisConnectionString = builder.Configuration.GetConnectionString("RedisConnection");

            if (useRedis && !string.IsNullOrEmpty(redisConnectionString) && !redisConnectionString.Contains("YOUR_", StringComparison.OrdinalIgnoreCase))
            {
                builder.Services.AddStackExchangeRedisCache(options =>
                {
                    options.Configuration = redisConnectionString;
                    options.InstanceName = "Cinema_";
                });
            }
            else
            {
                builder.Services.AddDistributedMemoryCache();
            }

            builder.Services.AddAutoMapper(typeof(ReservationProfile));
            builder.Services.AddScoped<IReservationService, ReservationService>();
            builder.Services.AddScoped<IAuthService,AuthService>();
            builder.Services.AddScoped<IScreeningService,ScreeningService>();
            builder.Services.AddScoped<IMovieService,MovieService>();
            builder.Services.AddSingleton<IServiceBusService, ServiceBusService>();
            builder.Services.AddSingleton<IEmailSender, SmtpEmailSenderService>();

            builder.Services.AddSingleton(x => new BlobServiceClient(builder.Configuration.GetConnectionString("BlobStorage")));
            builder.Services.AddScoped<IBlobService, BlobService>();

            // Rejestracja Cosmos DB
            var cosmosEndpoint = builder.Configuration["CosmosDb:Endpoint"];
            var cosmosKey = builder.Configuration["CosmosDb:Key"];
            var databaseName = builder.Configuration["CosmosDb:DatabaseName"];
            var containerName = builder.Configuration["CosmosDb:ContainerName"];

            // Tworzymy Singleton instancji CosmosClient zgodnie z najlepszymi praktykami
            builder.Services.AddSingleton<Microsoft.Azure.Cosmos.CosmosClient>(s => 
            {
                if (cosmosEndpoint.Contains("TWOJA-BAZA")) 
                {
                    // To tylko ochrona przed wyrzucaniem bledu na starcie, gdy uzytkownik jeszcze nie podal kluczy
                    return null;
                }
                return new Microsoft.Azure.Cosmos.CosmosClient(cosmosEndpoint, cosmosKey);
            });
            
            builder.Services.AddScoped<IReviewService>(s => 
            {
                var client = s.GetRequiredService<Microsoft.Azure.Cosmos.CosmosClient>();
                if(client == null) {
                    return null; // Zabezpieczenie przed rzucaniem wyjatku gdy brak kluczy
                }
                return new ReviewService(client, databaseName, containerName);
            });


            builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
            if (ServiceBusConfig.IsEnabled(builder.Configuration))
            {
                builder.Services.AddHostedService<UserRegistrationEmailWorker>();
                builder.Services.AddHostedService<TicketEmailWorker>();
            }

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
                };
            });

            builder.Services.AddAuthorization();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("FrontendPolicy", policy =>
                {
                    policy.WithOrigins("http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:4200") // React/Vue/Vite/Angular ports
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials(); // Often needed for auth
                });
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // app.UseHttpsRedirection();
            app.UseCors("FrontendPolicy");

            app.UseAuthentication();
            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}

using Microsoft.Extensions.Configuration;

namespace CinemaBookingApp2.Configurations
{
    public static class ServiceBusConfig
    {
        public static bool IsEnabled(IConfiguration configuration)
        {
            if (!configuration.GetValue("UseServiceBus", true))
                return false;

            var connectionString = configuration.GetConnectionString("ServiceBus");
            if (string.IsNullOrWhiteSpace(connectionString))
                return false;

            if (connectionString.Contains("YOUR_", StringComparison.OrdinalIgnoreCase))
                return false;

            if (!connectionString.Contains("SharedAccessKey=", StringComparison.OrdinalIgnoreCase))
                return false;

            if (!connectionString.Contains("servicebus.windows.net", StringComparison.OrdinalIgnoreCase))
                return false;

            return true;
        }
    }
}

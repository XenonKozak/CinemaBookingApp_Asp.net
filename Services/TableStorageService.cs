using System;
using System.Threading.Tasks;
using Azure.Data.Tables;
using CinemaBookingApp2.Interfaces;
using CinemaBookingApp2.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CinemaBookingApp2.Services
{
    public class TableStorageService : ITableStorageService
    {
        private readonly TableClient _tableClient;
        private readonly ILogger<TableStorageService> _logger;

        public TableStorageService(IConfiguration configuration, ILogger<TableStorageService> logger)
        {
            _logger = logger;
            try
            {
                // Używamy connection stringa z blobów, ponieważ standardowo zawiera on dostęp do Table Storage
                var connectionString = configuration.GetConnectionString("BlobStorage");
                var serviceClient = new TableServiceClient(connectionString);
                
                // Tworzymy tabelę "ActivityLogs" jeśli nie istnieje
                _tableClient = serviceClient.GetTableClient("ActivityLogs");
                _tableClient.CreateIfNotExists();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Nie udało się zainicjować TableStorageService.");
            }
        }

        public async Task LogActivityAsync(ActivityLogEntity logEntity)
        {
            if (_tableClient == null)
            {
                _logger.LogWarning("TableClient nie jest zainicjowany. Logowanie przerwane.");
                return;
            }

            try
            {
                await _tableClient.AddEntityAsync(logEntity);
                _logger.LogInformation("Zapisano log aktywności do Table Storage: {Action}", logEntity.PartitionKey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Wystąpił błąd podczas zapisywania logu do Azure Table Storage.");
            }
        }
        
        public async Task<System.Collections.Generic.IEnumerable<ActivityLogEntity>> GetLogsAsync()
        {
            var logs = new System.Collections.Generic.List<ActivityLogEntity>();
            if (_tableClient == null) return logs;

            try
            {
                var queryResults = _tableClient.QueryAsync<ActivityLogEntity>();
                await foreach (var entity in queryResults)
                {
                    logs.Add(entity);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Wystąpił błąd podczas pobierania logów z Azure Table Storage.");
            }
            
            // Sortowanie po dacie malejąco
            logs.Sort((a, b) => (b.Timestamp ?? DateTimeOffset.MinValue).CompareTo(a.Timestamp ?? DateTimeOffset.MinValue));
            return logs;
        }
    }
}

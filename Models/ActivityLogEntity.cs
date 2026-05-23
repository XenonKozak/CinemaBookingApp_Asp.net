using System;
using Azure;
using Azure.Data.Tables;

namespace CinemaBookingApp2.Models
{
    public class ActivityLogEntity : ITableEntity
    {
        public string PartitionKey { get; set; } // np. "UserLogin", "UserRegister"
        public string RowKey { get; set; } // np. Guid
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }

        // Własne właściwości
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string ActionDetails { get; set; }

        public ActivityLogEntity() { }

        public ActivityLogEntity(string partitionKey, string userId, string userName, string actionDetails)
        {
            PartitionKey = partitionKey;
            RowKey = Guid.NewGuid().ToString();
            Timestamp = DateTimeOffset.UtcNow;
            UserId = userId;
            UserName = userName;
            ActionDetails = actionDetails;
        }
    }
}

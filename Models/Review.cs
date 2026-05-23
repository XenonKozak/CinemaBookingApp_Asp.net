using System;
using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace CinemaBookingApp2.Models
{
    public class Review
    {
        [JsonProperty(PropertyName = "id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [JsonProperty(PropertyName = "movieId")]
        public string MovieId { get; set; }

        [JsonProperty(PropertyName = "userId")]
        public string UserId { get; set; }

        [JsonProperty(PropertyName = "rating")]
        public int Rating { get; set; }

        [JsonProperty(PropertyName = "comment")]
        public string Comment { get; set; }
        
        [JsonProperty(PropertyName = "sentiment")]
        public string? Sentiment { get; set; }

        [JsonProperty(PropertyName = "createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

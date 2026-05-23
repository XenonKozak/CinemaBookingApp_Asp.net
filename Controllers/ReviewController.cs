using System;
using System.Threading.Tasks;
using CinemaBookingApp2.Interfaces;
using CinemaBookingApp2.Models;
using Microsoft.AspNetCore.Mvc;
using Azure.AI.TextAnalytics;

namespace CinemaBookingApp2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _reviewService;
        private readonly TextAnalyticsClient _aiClient;

        public ReviewController(IReviewService reviewService, TextAnalyticsClient aiClient = null)
        {
            _reviewService = reviewService;
            _aiClient = aiClient;
        }

        [HttpPost]
        public async Task<IActionResult> AddReview([FromBody] Review review)
        {
            if (_reviewService == null)
            {
                return StatusCode(500, "Usługa Cosmos DB nie została poprawnie skonfigurowana. Wprowadź klucze w appsettings.json.");
            }

            try
            {
                review.Id = Guid.NewGuid().ToString();
                review.CreatedAt = DateTime.UtcNow;

                // Cenzura wulgaryzmów przed zapisem i analizą AI!
                if (!string.IsNullOrWhiteSpace(review.Comment))
                {
                    review.Comment = CensorProfanity(review.Comment);
                }

                // AI Sentiment Analysis
                if (_aiClient != null && !string.IsNullOrWhiteSpace(review.Comment))
                {
                    try
                    {
                        DocumentSentiment documentSentiment = await _aiClient.AnalyzeSentimentAsync(review.Comment);
                        review.Sentiment = documentSentiment.Sentiment.ToString(); // "Positive", "Negative", "Neutral" or "Mixed"
                    }
                    catch (Exception)
                    {
                        review.Sentiment = "Unknown";
                    }
                }
                else
                {
                    review.Sentiment = "Unknown";
                }

                await _reviewService.AddReviewAsync(review);
                return CreatedAtAction(nameof(GetReviewsForMovie), new { movieId = review.MovieId }, review);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("movie/{movieId}")]
        public async Task<IActionResult> GetReviewsForMovie(string movieId)
        {
            if (_reviewService == null)
            {
                return StatusCode(500, "Usługa Cosmos DB nie została poprawnie skonfigurowana. Wprowadź klucze w appsettings.json.");
            }

            try
            {
                var reviews = await _reviewService.GetReviewsForMovieAsync(movieId);
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private string CensorProfanity(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return text;

            var badWords = new[] 
            { 
                "kurw", "jeb", "pierd", "chuj", "pizd", "gówn", "srac", 
                "fuck", "shit", "bitch", "asshole"
            };

            string censoredText = text;
            foreach (var word in badWords)
            {
                var regex = new System.Text.RegularExpressions.Regex(
                    @"\b(" + word + @"\w*)\b", 
                    System.Text.RegularExpressions.RegexOptions.IgnoreCase);

                censoredText = regex.Replace(censoredText, m =>
                {
                    string matched = m.Value;
                    if (matched.Length <= 2) return new string('*', matched.Length);
                    return matched[0] + new string('*', matched.Length - 2) + matched[matched.Length - 1];
                });
            }

            return censoredText;
        }
    }
}

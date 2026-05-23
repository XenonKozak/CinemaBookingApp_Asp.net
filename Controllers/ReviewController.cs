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
    }
}

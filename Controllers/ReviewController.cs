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
                string originalComment = review.Comment;

                // AI Sentiment Analysis (analizujemy przed cenzurą, żeby AI zrozumiało emocje ukryte w wulgaryzmach!)
                if (_aiClient != null && !string.IsNullOrWhiteSpace(originalComment))
                {
                    try
                    {
                        using var cts = new System.Threading.CancellationTokenSource(TimeSpan.FromSeconds(1));
                        DocumentSentiment documentSentiment = await _aiClient.AnalyzeSentimentAsync(originalComment, "pl", cancellationToken: cts.Token);
                        review.Sentiment = GetSentiment(review.Rating, documentSentiment.Sentiment.ToString(), originalComment);
                    }
                    catch (Exception)
                    {
                        review.Sentiment = GetSentiment(review.Rating, "Unknown", originalComment);
                    }
                }
                else
                {
                    review.Sentiment = GetSentiment(review.Rating, "Unknown", originalComment);
                }

                // Cenzurujemy komentarz dopiero PO analizie sentymentu, a przed zapisem do bazy!
                if (!string.IsNullOrWhiteSpace(review.Comment))
                {
                    review.Comment = CensorProfanity(review.Comment);
                }

                // Sprawdzamy, czy użytkownik wystawił już recenzję dla tego filmu
                var existingReview = await _reviewService.GetUserReviewForMovieAsync(review.MovieId, review.UserId);
                if (existingReview != null)
                {
                    // Nadpisujemy istniejącą recenzję
                    review.Id = existingReview.Id;
                    review.CreatedAt = DateTime.UtcNow; // Aktualizujemy datę, aby opinia trafiła na górę listy
                    await _reviewService.UpdateReviewAsync(review);
                }
                else
                {
                    // Tworzymy nową recenzję
                    review.Id = Guid.NewGuid().ToString();
                    review.CreatedAt = DateTime.UtcNow;
                    await _reviewService.AddReviewAsync(review);
                }

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

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReview(string id, [FromBody] Review review)
        {
            if (_reviewService == null)
            {
                return StatusCode(500, "Usługa Cosmos DB nie została poprawnie skonfigurowana. Wprowadź klucze w appsettings.json.");
            }

            if (id != review.Id)
            {
                return BadRequest("ID recenzji się nie zgadza.");
            }

            try
            {
                string originalComment = review.Comment;

                // AI Sentiment Analysis (analizujemy przed cenzurą, żeby AI zrozumiało emocje ukryte w wulgaryzmach!)
                if (_aiClient != null && !string.IsNullOrWhiteSpace(originalComment))
                {
                    try
                    {
                        using var cts = new System.Threading.CancellationTokenSource(TimeSpan.FromSeconds(1));
                        DocumentSentiment documentSentiment = await _aiClient.AnalyzeSentimentAsync(originalComment, "pl", cancellationToken: cts.Token);
                        review.Sentiment = GetSentiment(review.Rating, documentSentiment.Sentiment.ToString(), originalComment);
                    }
                    catch (Exception)
                    {
                        review.Sentiment = GetSentiment(review.Rating, "Unknown", originalComment);
                    }
                }
                else
                {
                    review.Sentiment = GetSentiment(review.Rating, "Unknown", originalComment);
                }

                // Cenzurujemy komentarz dopiero PO analizie sentymentu, a przed zapisem do bazy!
                if (!string.IsNullOrWhiteSpace(review.Comment))
                {
                    review.Comment = CensorProfanity(review.Comment);
                }

                review.CreatedAt = DateTime.UtcNow; // Aktualizujemy czas, żeby opinia trafiła na górę listy
                await _reviewService.UpdateReviewAsync(review);
                return Ok(review);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(string id, [FromQuery] string movieId)
        {
            if (_reviewService == null)
            {
                return StatusCode(500, "Usługa Cosmos DB nie została poprawnie skonfigurowana. Wprowadź klucze w appsettings.json.");
            }

            if (string.IsNullOrEmpty(movieId))
            {
                return BadRequest("MovieId jest wymagane jako query parameter do usunięcia recenzji w Cosmos DB.");
            }

            try
            {
                await _reviewService.DeleteReviewAsync(id, movieId);
                return NoContent();
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

        private string GetSentiment(int rating, string? textSentiment, string comment)
        {
            // Szybki fallback na twarde polskie słowa, które AI może uznać za Neutralne z braku kontekstu
            if (!string.IsNullOrWhiteSpace(comment))
            {
                string lowerComment = comment.ToLower();
                
                var hardNegativeWords = new[] { "chuj", "gówn", "srac", "pizd", "kurw" };
                var hardPositiveWords = new[] { "zajebi", "zajebis", "zajebist" };

                // Sprawdzamy najpierw pozytywne wulgaryzmy (np. "zajebisty")
                foreach (var w in hardPositiveWords)
                {
                    if (lowerComment.Contains(w)) return "Positive";
                }

                // Następnie negatywne wulgaryzmy
                foreach (var w in hardNegativeWords)
                {
                    if (lowerComment.Contains(w)) return "Negative";
                }
            }

            // Jeśli AI wykryło jednoznaczny sentyment, ufamy mu.
            if (textSentiment == "Positive" || textSentiment == "Negative")
            {
                return textSentiment;
            }

            // W przypadku Mixed, Neutral lub Unknown, polegamy na gwiazdkach:
            if (rating >= 4) return "Positive";
            if (rating == 3) return "Neutral";
            return "Negative";
        }
    }
}

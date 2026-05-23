using System.Collections.Generic;
using System.Threading.Tasks;
using CinemaBookingApp2.Models;

namespace CinemaBookingApp2.Interfaces
{
    public interface IReviewService
    {
        Task AddReviewAsync(Review review);
        Task<IEnumerable<Review>> GetReviewsForMovieAsync(string movieId);
        Task<Review> GetUserReviewForMovieAsync(string movieId, string userId);
        Task UpdateReviewAsync(Review review);
        Task DeleteReviewAsync(string id, string movieId);
    }
}

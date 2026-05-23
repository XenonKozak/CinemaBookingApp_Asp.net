using System.Collections.Generic;
using System.Threading.Tasks;
using CinemaBookingApp2.Interfaces;
using CinemaBookingApp2.Models;
using Microsoft.Azure.Cosmos;

namespace CinemaBookingApp2.Services
{
    public class ReviewService : IReviewService
    {
        private Container _container;

        public ReviewService(
            CosmosClient dbClient,
            string databaseName,
            string containerName)
        {
            this._container = dbClient.GetContainer(databaseName, containerName);
        }

        public async Task AddReviewAsync(Review review)
        {
            await this._container.CreateItemAsync<Review>(review, new PartitionKey(review.MovieId));
        }

        public async Task<IEnumerable<Review>> GetReviewsForMovieAsync(string movieId)
        {
            var query = this._container.GetItemQueryIterator<Review>(new QueryDefinition("SELECT * FROM c WHERE c.movieId = @movieId").WithParameter("@movieId", movieId));
            List<Review> results = new List<Review>();
            while (query.HasMoreResults)
            {
                var response = await query.ReadNextAsync();
                
                results.AddRange(response.ToList());
            }

            return results;
        }

        public async Task<Review> GetUserReviewForMovieAsync(string movieId, string userId)
        {
            var query = this._container.GetItemQueryIterator<Review>(new QueryDefinition(
                "SELECT * FROM c WHERE c.movieId = @movieId AND c.userId = @userId")
                .WithParameter("@movieId", movieId)
                .WithParameter("@userId", userId));

            while (query.HasMoreResults)
            {
                var response = await query.ReadNextAsync();
                foreach (var item in response)
                {
                    return item;
                }
            }
            return null;
        }

        public async Task UpdateReviewAsync(Review review)
        {
            await this._container.ReplaceItemAsync<Review>(review, review.Id, new PartitionKey(review.MovieId));
        }

        public async Task DeleteReviewAsync(string id, string movieId)
        {
            await this._container.DeleteItemAsync<Review>(id, new PartitionKey(movieId));
        }
    }
}

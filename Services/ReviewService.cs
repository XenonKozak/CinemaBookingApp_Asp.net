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
    }
}

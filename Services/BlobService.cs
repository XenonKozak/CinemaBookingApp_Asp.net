using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using CinemaBookingApp2.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace CinemaBookingApp2.Services
{
    public class BlobService : IBlobService
    {
        private readonly BlobServiceClient _blobServiceClient;
        private readonly IConfiguration _configuration;
        private readonly string _containerName = "posters";

        public BlobService(BlobServiceClient blobServiceClient, IConfiguration configuration)
        {
            _blobServiceClient = blobServiceClient;
            _configuration = configuration;
        }

        public async Task<string> UploadImageAsync(IFormFile file, string fileName)
        {
            var connectionString = _configuration.GetConnectionString("BlobStorage");
            if (string.IsNullOrEmpty(connectionString) || 
                connectionString.Contains("YOUR_KEY") || 
                connectionString.Contains("YOUR_STORAGE_ACCOUNT"))
            {
                Console.WriteLine("[Blob Service] Wykryto domyślny plakat / placeholder dla połączenia z Azure Blob Storage. Zwracam link do plakatu filmowego.");
                return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=400";
            }

            try
            {
                var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
                
                // Tworzy kontener, jeśli nie istnieje (zabezpieczenie lokalne)
                await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

                var blobClient = containerClient.GetBlobClient(fileName);

                using var stream = file.OpenReadStream();
                await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType });

                return blobClient.Uri.ToString();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Blob Service Error] Nie udało się przesłać pliku do Azure Blob Storage: {ex.Message}. Zwracam plakat domyślny.");
                return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=400";
            }
        }
    }
}

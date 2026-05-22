using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using CinemaBookingApp2.Interfaces;
using Microsoft.AspNetCore.Http;

namespace CinemaBookingApp2.Services
{
    public class BlobService : IBlobService
    {
        private readonly BlobServiceClient _blobServiceClient;
        private readonly string _containerName = "posters";

        public BlobService(BlobServiceClient blobServiceClient)
        {
            _blobServiceClient = blobServiceClient;
        }

        public async Task<string> UploadImageAsync(IFormFile file, string fileName)
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            
            // Tworzy kontener, jeśli nie istnieje (zabezpieczenie lokalne)
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

            var blobClient = containerClient.GetBlobClient(fileName);

            using var stream = file.OpenReadStream();
            await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType });

            return blobClient.Uri.ToString();
        }
    }
}

using Microsoft.AspNetCore.Http;

namespace CinemaBookingApp2.Interfaces
{
    public interface IBlobService
    {
        Task<string> UploadImageAsync(IFormFile file, string fileName);
    }
}

using AutoMapper;
using CinemaBookingApp2.Db;
using CinemaBookingApp2.DTOs.MovieDTOs;
using CinemaBookingApp2.Interfaces;
using CinemaBookingApp2.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace CinemaBookingApp2.Services
{
    public class MovieService : IMovieService
    {
        private readonly ReservationContext _context;
        private readonly IMapper _mapper;
        private readonly IDistributedCache _cache;
        private const string CacheKey = "all_movies";

        public MovieService(ReservationContext context, IMapper mapper, IDistributedCache cache)
        {
            _context = context;
            _mapper = mapper;
            _cache = cache;
        }

        public async Task<IEnumerable<GetMovieDto>> GetMovies()
        {
            var movies = await _context.Movies.ToListAsync();
            return _mapper.Map<IEnumerable<GetMovieDto>>(movies);
        }

        public async Task<IEnumerable<GetMovieWithScreeningsDto>> GetMoviesWithScreenings()
        {
            try
            {
                var cachedData = await _cache.GetStringAsync(CacheKey);
                if (!string.IsNullOrEmpty(cachedData))
                {
                    return JsonSerializer.Deserialize<IEnumerable<GetMovieWithScreeningsDto>>(cachedData) ?? new List<GetMovieWithScreeningsDto>();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Redis Error] Błąd pobierania z cache: {ex.Message}");
            }

            var movies = await _context.Movies.Include(m => m.Screenings).ToListAsync();
            var dtos = _mapper.Map<IEnumerable<GetMovieWithScreeningsDto>>(movies);

            try
            {
                var cacheOptions = new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5) };
                await _cache.SetStringAsync(CacheKey, JsonSerializer.Serialize(dtos), cacheOptions);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Redis Error] Błąd zapisu do cache: {ex.Message}");
            }

            return dtos;
        }

        public async Task<GetMovieDto?> GetMovieById(Guid id)
        {
            var movie = await _context.Movies.SingleOrDefaultAsync(m => m.Id == id);
            if (movie == null) return null;
            return _mapper.Map<GetMovieDto>(movie);
        }

        public async Task<GetMovieWithScreeningsDto?> GetMovieByIdWithScreenings(Guid id)
        {
            var movie = await _context.Movies.Include(m => m.Screenings).SingleOrDefaultAsync(m => m.Id == id);
            if (movie == null) return null;
            return _mapper.Map<GetMovieWithScreeningsDto>(movie);
        }

        public async Task<Guid?> CreateMovie(CreateMovieDto dto)
        {
            var movieExist = await _context.Movies.AnyAsync(m => m.Title == dto.Title);
            if (movieExist) return null;

            var movie = Movie.CreateMovie(Guid.NewGuid(), dto.Title, dto.Description, dto.Duration);
            await _context.Movies.AddAsync(movie);
            await _context.SaveChangesAsync();
            await ClearCacheAsync();
            return movie.Id;
        }

        public async Task<bool> UpdateMovie(Guid id, UpdateMovieDto dto)
        {
            var movie = await _context.Movies.SingleOrDefaultAsync(m => m.Id == id);
            if (movie == null) return false;

            movie.UpdateMovie(dto.Title, dto.Description, dto.Duration);
            await _context.SaveChangesAsync();
            await ClearCacheAsync();
            return true;
        }

        public async Task<bool> UpdatePosterUrl(Guid id, string imageUrl)
        {
            var movie = await _context.Movies.SingleOrDefaultAsync(m => m.Id == id);
            if (movie == null) return false;

            movie.ImageUrl = imageUrl;
            await _context.SaveChangesAsync();
            await ClearCacheAsync();
            return true;
        }

        public async Task<bool> DeleteMovie(Guid id)
        {
            var movie = await _context.Movies.SingleOrDefaultAsync(m => m.Id == id);
            if (movie == null) return false;

            _context.Movies.Remove(movie);
            await _context.SaveChangesAsync();
            await ClearCacheAsync();
            return true;
        }

        private async Task ClearCacheAsync()
        {
            try { await _cache.RemoveAsync(CacheKey); } catch {}
        }
    }
}

using CinemaBookingApp2.DTOs.MovieDTOs;
using CinemaBookingApp2.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaBookingApp2.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MovieController : ControllerBase
    {
        private readonly IMovieService _movieService;
        private readonly IBlobService _blobService;

        public MovieController(IMovieService movieService, IBlobService blobService)
        {
            _movieService = movieService;
            _blobService = blobService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<GetMovieDto>>> GetAll()
        {
            var movies = await _movieService.GetMovies();
            return Ok(movies);
        }

        [HttpGet("with-screenings")]
        public async Task<ActionResult<IEnumerable<GetMovieWithScreeningsDto>>> GetAllWithScreenings()
        {
            var movies = await _movieService.GetMoviesWithScreenings();
            return Ok(movies);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<GetMovieDto>> GetById(Guid id)
        {
            var movie = await _movieService.GetMovieById(id);
            if (movie == null) return NotFound();
            return Ok(movie);
        }

        [HttpGet("{id}/with-screenings")]
        public async Task<ActionResult<GetMovieWithScreeningsDto>> GetByIdWithScreenings(Guid id)
        {
            var movie = await _movieService.GetMovieByIdWithScreenings(id);
            if (movie == null) return NotFound();
            return Ok(movie);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> CreateMovie(CreateMovieDto dto)
        {
            var movieId = await _movieService.CreateMovie(dto);
            if (movieId == null) return BadRequest("Film o takim tytule już istnieje.");
            return CreatedAtAction(nameof(GetById), new { id = movieId }, new { Id = movieId });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UpdateMovie(Guid id, UpdateMovieDto dto)
        {
            var success = await _movieService.UpdateMovie(id, dto);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpPost("{id}/poster")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UploadPoster(Guid id, IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("No file uploaded.");
            var movie = await _movieService.GetMovieById(id);
            if (movie == null) return NotFound();

            var imageUrl = await _blobService.UploadImageAsync(file, file.FileName);
            if (string.IsNullOrEmpty(imageUrl)) return BadRequest("Failed to upload image.");

            var success = await _movieService.UpdatePosterUrl(id, imageUrl);
            if (!success) return BadRequest("Failed to update movie poster.");

            return Ok(new { ImageUrl = imageUrl });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteMovie(Guid id)
        {
            var success = await _movieService.DeleteMovie(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}

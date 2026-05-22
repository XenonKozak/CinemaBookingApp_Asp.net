using CinemaBookingApp2.Db;
using CinemaBookingApp2.DTOs.ScreeningDTOs;
using CinemaBookingApp2.Interfaces;
using CinemaBookingApp2.Models;
using CinemaBookingApp2.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CinemaBookingApp2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScreeningController : ControllerBase
    {

        private readonly IScreeningService _screeningService;
        private readonly IBlobService _blobService;

        public ScreeningController(IScreeningService screeningService, IBlobService blobService)
        {
            _screeningService = screeningService;
            _blobService = blobService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<GetScreeningDto>>>GetAll()
        {
            var screenings = await _screeningService.GetScreenings();
            if (screenings == null)
            {
                return NotFound();
            }
            return Ok(screenings);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<GetScreeningDto>>GetById(Guid id)
        {
            var screening = await _screeningService.GetScreeningById(id);
            if (screening is null)
            { 
                return NotFound();
            }
            return Ok(screening);
        }

        [HttpGet("{id:guid}/Details")]
        public async Task<ActionResult<GetScreeningWithReservDto>> GetScreeningByIdWithReservation(Guid id)
        {
            var screening = await _screeningService.GetScreeningByIdWthReserv(id);
            if (screening is null)
            {
                return NotFound();
            }
            return Ok(screening);
        }

        [Authorize (Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Screening>>CreateScreening(CreateScreeningDto screeningDto)
        {
            
            var screeningId = await _screeningService.CreateScreeningId(screeningDto);
            if (screeningId == null)
            {
                return BadRequest();
            }

            return CreatedAtAction(nameof(GetById), new { id = screeningId }, new { Id = screeningId, MovieTitle = screeningDto.MovieTitle, Description = screeningDto.Description, Duration = screeningDto.Duration });
        }

        [Authorize(Roles ="Admin")]
        [HttpPut("{id:guid}")]
        public async Task<ActionResult<Screening>>UpdateById(Guid id, UpdateScreeningDto dto)
        {
            var screeningExist = await _screeningService.UpdateScreeningById(id, dto);
            if (!screeningExist)
            {
                return NotFound();
            }

            return Ok();
        }

        [HttpPost("{id:guid}/poster")]
        public async Task<IActionResult> UploadPoster(Guid id, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            var screening = await _screeningService.GetScreeningById(id);
            if (screening == null)
            {
                return NotFound();
            }

            // Unikalna nazwa pliku (np. id_seansu + oryginalne rozszerzenie)
            var extension = Path.GetExtension(file.FileName);
            var fileName = $"{id}{extension}";

            var imageUrl = await _blobService.UploadImageAsync(file, fileName);
            
            var updated = await _screeningService.UpdatePosterUrl(id, imageUrl);
            if (!updated)
            {
                return BadRequest("Failed to update screening poster.");
            }

            return Ok(new { ImageUrl = imageUrl });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:guid}")]
        public async Task<ActionResult<Screening>>DeleteScreeningById(Guid id)
        {
            var screening = await _screeningService.DeleteScreeningById(id);
            if (!screening)
            {
                return NotFound();
            }
            return NoContent();
        }

    }
}

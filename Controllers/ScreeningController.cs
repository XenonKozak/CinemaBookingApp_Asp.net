using CinemaBookingApp2.DTOs.ScreeningDTOs;
using CinemaBookingApp2.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaBookingApp2.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ScreeningController : ControllerBase
    {
        private readonly IScreeningService _screeningService;

        public ScreeningController(IScreeningService screeningService)
        {
            _screeningService = screeningService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<GetScreeningDto>>> GetAll()
        {
            var screenings = await _screeningService.GetScreenings();
            return Ok(screenings);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<GetScreeningDto>> GetById(Guid id)
        {
            var screening = await _screeningService.GetScreeningById(id);
            if (screening == null) return NotFound();
            return Ok(screening);
        }

        [HttpGet("{id}/reservation")]
        [HttpGet("{id}/Details")]
        public async Task<ActionResult<GetScreeningWithReservDto>> GetScreeningByIdWithReservation(Guid id)
        {
            var screening = await _screeningService.GetScreeningByIdWthReserv(id);
            if (screening == null) return NotFound();
            return Ok(screening);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> CreateScreening(CreateScreeningDto screeningDto)
        {
            var screeningId = await _screeningService.CreateScreeningId(screeningDto);
            if (screeningId == null) return BadRequest("Seans dla tego filmu o tej samej godzinie już istnieje.");
            return CreatedAtAction(nameof(GetById), new { id = screeningId }, new { Id = screeningId });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UpdateById(Guid id, UpdateScreeningDto dto)
        {
            var success = await _screeningService.UpdateScreeningById(id, dto);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteScreeningById(Guid id)
        {
            var success = await _screeningService.DeleteScreeningById(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}

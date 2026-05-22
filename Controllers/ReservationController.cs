using CinemaBookingApp2.Db;
using CinemaBookingApp2.DTOs.ReservationDto;
using CinemaBookingApp2.Interfaces;
using CinemaBookingApp2.Models;
using CinemaBookingApp2.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CinemaBookingApp2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationController : ControllerBase
    {
        
       
        private readonly IReservationService _service;

        public ReservationController(IReservationService service)
        { 
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<GetReservationDto>>>GetReservations()
        {
            var reservation = await _service.GetAll();
            if (reservation == null)
            { 
                return NotFound();
            }  
                return Ok(reservation);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<GetReservationDto>> GetReservationById(Guid id)
        { 
            var reservation = await _service.GetById(id);
            if (reservation == null)
            {
                return NotFound();
            }
                return Ok(reservation);
        }

        [Authorize]
        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<GetReservationDto>>> GetMyReservations()
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var reservations = await _service.GetByUserId(userId);
            return Ok(reservations);
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Reservation>> CreateReservation(CreateReservationDto reservationDto)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var id = await _service.Create(reservationDto, userId);
            if (id is null)
            {
                return BadRequest();
            }
            return CreatedAtAction(nameof(GetReservationById), new { id = id }, reservationDto);
        }

        [Authorize]
        [HttpPut("{id:guid}")]
        public async Task<ActionResult<Reservation>> PutReservation(Guid id, UpdateReservationDto dto)
        {
            var reservationExist = await _service.Update(id,dto);
            if (!reservationExist)
            {
                return NotFound();
            }
                return Ok(reservationExist);
        }

        [Authorize]
        [HttpDelete("{id:guid}")]
        public async Task<ActionResult<Reservation>> DeleteReservation(Guid id)
        {
            var reservation = await _service.Delete(id);
            if (!reservation)
            {   
                return NotFound();
            }    
                return NoContent();

        }
    }
}

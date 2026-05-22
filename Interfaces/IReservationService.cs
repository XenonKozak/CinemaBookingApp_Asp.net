using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using CinemaBookingApp2.DTOs.ReservationDto;

namespace CinemaBookingApp2.Interfaces
{
    public interface IReservationService
    {
        Task<IEnumerable<GetReservationDto>> GetAll();
        Task<IEnumerable<GetReservationDto>> GetByUserId(Guid userId);
        Task<GetReservationDto> GetById(Guid id);
        Task<Guid?> Create(CreateReservationDto dto, Guid userId);
        Task<bool> Update(Guid id, UpdateReservationDto dto);
        Task<bool> Delete(Guid id);
    }
}

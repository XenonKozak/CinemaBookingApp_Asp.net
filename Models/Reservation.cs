using System.ComponentModel.DataAnnotations;
using CinemaBookingApp2.DTOs.ReservationDto;
using CinemaBookingApp2.Exceptions;
using CinemaBookingApp2.Exceptions.ReservationExceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
namespace CinemaBookingApp2.Models
{
    public class Reservation
    {
        public Guid Id { get; private set; }
        public int SeatNumber { get; private set; }
        public string Row { get; private set; } = string.Empty;
        public DateTime ReservationDate { get; private set; }
        public Guid ScreeningId { get; private set; }
        public Screening Screening { get; set; } = null!;
        public Guid UserId { get; private set; }
        public User User { get; set; } = null!;
        public Guid BookingId { get; private set; }

        protected Reservation() {}

        public Reservation(Guid id, int seatNumber, string row, DateTime reservationDate, Guid screeningId, Guid userId, Guid bookingId)
        {
            ScreeningId = screeningId;
            UserId = userId;
            BookingId = bookingId == Guid.Empty ? Guid.NewGuid() : bookingId;
            Id = id == Guid.Empty? Guid.NewGuid() : id;
            ReservationDate = reservationDate;
            UpdateReservation(seatNumber, row);
        }

        public void UpdateReservation(int seatnumber, string row)
        {
            if (string.IsNullOrWhiteSpace(row))
            {
                throw new EmptyRowException();
            }

            if (seatnumber < 1 || seatnumber > 10)
            {
                throw new SeatNumberRangeException();
            }

            SeatNumber = seatnumber;
            Row = row;
        }

        public static Reservation CreateReservation(Guid id, int seatNumber, string row, DateTime reservationDate, Guid screeningId, Guid userId, Guid bookingId)
        {
            return new Reservation(id, seatNumber, row, reservationDate, screeningId, userId, bookingId);
        }


        }
    }

using AutoMapper;
using CinemaBookingApp2.DTOs.AuthDTOs;
using CinemaBookingApp2.DTOs.ReservationDto;
using CinemaBookingApp2.DTOs.ScreeningDTOs;
using CinemaBookingApp2.Models;

namespace CinemaBookingApp2.Configurations
{
    public class ReservationProfile: Profile
    {

        public ReservationProfile()
        {
            CreateMap<Reservation, CreateReservationDto>().ReverseMap();
            CreateMap<Reservation, GetReservationDto>()
                .ForMember(dest => dest.MovieTitle, opt => opt.MapFrom(src => src.Screening.MovieTitle));
            CreateMap<Reservation, UpdateReservationDto>().ReverseMap();
            CreateMap<User, RegisterUserDto>().ReverseMap();
            CreateMap<User, LoginUserDto>().ReverseMap();
            CreateMap<User, GetUsersDto>().ReverseMap();
            CreateMap<Screening, GetScreeningDto>().ReverseMap();
            CreateMap<Screening, CreateScreeningDto>().ReverseMap();
            CreateMap<Screening, UpdateScreeningDto>().ReverseMap();
            CreateMap<Screening, GetScreeningWithReservDto>().ReverseMap();
        }

    }
}

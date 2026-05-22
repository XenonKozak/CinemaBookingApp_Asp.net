using AutoMapper;
using CinemaBookingApp2.DTOs.AuthDTOs;
using CinemaBookingApp2.DTOs.ReservationDto;
using CinemaBookingApp2.DTOs.ScreeningDTOs;
using CinemaBookingApp2.DTOs.MovieDTOs;
using CinemaBookingApp2.Models;

namespace CinemaBookingApp2.Configurations
{
    public class ReservationProfile: Profile
    {

        public ReservationProfile()
        {
            CreateMap<Reservation, CreateReservationDto>().ReverseMap();
            CreateMap<Reservation, GetReservationDto>()
                .ForMember(dest => dest.MovieTitle, opt => opt.MapFrom(src => src.Screening.Movie.Title))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.Screening.Movie.ImageUrl));
            CreateMap<Reservation, UpdateReservationDto>().ReverseMap();
            CreateMap<User, RegisterUserDto>().ReverseMap();
            CreateMap<User, LoginUserDto>().ReverseMap();
            CreateMap<User, GetUsersDto>().ReverseMap();
            
            // Movie Maps
            CreateMap<Movie, GetMovieDto>().ReverseMap();
            CreateMap<Movie, CreateMovieDto>().ReverseMap();
            CreateMap<Movie, UpdateMovieDto>().ReverseMap();
            CreateMap<Movie, GetMovieWithScreeningsDto>()
                .ForMember(dest => dest.Screenings, opt => opt.MapFrom(src => src.Screenings));

            // Screening Maps
            CreateMap<Screening, GetScreeningDto>()
                .ForMember(dest => dest.MovieTitle, opt => opt.MapFrom(src => src.Movie != null ? src.Movie.Title : string.Empty))
                .ReverseMap();
            CreateMap<Screening, CreateScreeningDto>().ReverseMap();
            CreateMap<Screening, UpdateScreeningDto>().ReverseMap();
            CreateMap<Screening, GetScreeningWithReservDto>()
                .ForMember(dest => dest.MovieTitle, opt => opt.MapFrom(src => src.Movie != null ? src.Movie.Title : string.Empty))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Movie != null ? src.Movie.Description : string.Empty))
                .ForMember(dest => dest.Duration, opt => opt.MapFrom(src => src.Movie != null ? src.Movie.Duration : 0))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.Movie != null ? src.Movie.ImageUrl : null))
                .ReverseMap();
        }

    }
}

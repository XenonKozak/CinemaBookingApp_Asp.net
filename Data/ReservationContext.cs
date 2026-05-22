using CinemaBookingApp2.Models;
using Microsoft.EntityFrameworkCore;

namespace CinemaBookingApp2.Db
{
    public class ReservationContext: DbContext
    {
       public DbSet<Reservation> Reservations { get; set; }
       public DbSet<User> Users { get; set; }
       public DbSet<Screening> Screenings { get; set; }

        public ReservationContext(DbContextOptions<ReservationContext> options) : base(options) 
        {
        
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Screening>()
                .HasMany(s => s.Reservations)
                .WithOne(r => r.Screening)
                .HasForeignKey(r => r.ScreeningId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>()
                .HasMany(u => u.Reservations)
                .WithOne(r => r.User)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }

    }
}

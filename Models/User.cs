using CinemaBookingApp2.Exceptions.AuthExceptions;
using System.Reflection.Metadata.Ecma335;

namespace CinemaBookingApp2.Models
{
    public class User
    {
        public Guid Id { get; private set; } = Guid.NewGuid();
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "User";
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();

        protected User() { }

        public User(Guid id, string name, string passwordHash, string email) 
        {
            Id = id == Guid.Empty ? Guid.NewGuid() : id;
            UserName = name;
            Email = email;
            PasswordHash = passwordHash;
            
        }

        public static User CreateUser(Guid id, string name, string passwordHash, string email)
        {
            if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(passwordHash) || string.IsNullOrWhiteSpace(email))
            {
                throw new EmptyRecordsException();
            }
            return new User(id, name, passwordHash, email);
        }
    }
}

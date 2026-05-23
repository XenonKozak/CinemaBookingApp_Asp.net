using System.Threading.Tasks;
using CinemaBookingApp2.Models;

namespace CinemaBookingApp2.Interfaces
{
    public interface ITableStorageService
    {
        Task LogActivityAsync(ActivityLogEntity logEntity);
    }
}

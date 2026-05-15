namespace DocumentManagement.API.Models;

public class Conversation
{
    public int ConvId { get; set; }
    public int DocId { get; set; }
    public int UserId { get; set; }
    public DateTime StartTime { get; set; } = DateTime.UtcNow;

    public Document Document { get; set; } = null!;
    public User User { get; set; } = null!;
    public ICollection<Message> Messages { get; set; } = [];
}

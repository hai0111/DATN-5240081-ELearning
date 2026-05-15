namespace DocumentManagement.API.Models;

public class Message
{
    public int MessageId { get; set; }
    public int ConvId { get; set; }
    public string SenderType { get; set; } = string.Empty; // "User" or "AI"
    public string Content { get; set; } = string.Empty;
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    public Conversation Conversation { get; set; } = null!;
}

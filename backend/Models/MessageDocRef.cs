namespace DocumentManagement.API.Models;

public class MessageDocRef
{
    public int MessageId { get; set; }
    public int DocId { get; set; }

    public Message Message { get; set; } = null!;
    public Document Document { get; set; } = null!;
}

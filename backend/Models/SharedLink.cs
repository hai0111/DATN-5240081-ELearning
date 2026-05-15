namespace DocumentManagement.API.Models;

public class SharedLink
{
    public int ShareId { get; set; }
    public int DocId { get; set; }
    public int SharedWithId { get; set; }
    public string Permission { get; set; } = "Read";
    public DateTime? ExpiredAt { get; set; }

    public Document Document { get; set; } = null!;
    public User SharedWith { get; set; } = null!;
}

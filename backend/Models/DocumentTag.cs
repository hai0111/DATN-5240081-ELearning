namespace DocumentManagement.API.Models;

public class DocumentTag
{
    public int DocId { get; set; }
    public int TagId { get; set; }
    public bool IsAiSuggested { get; set; } = true;

    public Document Document { get; set; } = null!;
    public Tag Tag { get; set; } = null!;
}

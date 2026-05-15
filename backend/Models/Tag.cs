namespace DocumentManagement.API.Models;

public class Tag
{
    public int TagId { get; set; }
    public string TagName { get; set; } = string.Empty;
    public ICollection<DocumentTag> DocumentTags { get; set; } = [];
}

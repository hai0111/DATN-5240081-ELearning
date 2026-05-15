namespace DocumentManagement.API.Models;

public class Category
{
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ICollection<Document> Documents { get; set; } = [];
}

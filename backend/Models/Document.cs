namespace DocumentManagement.API.Models;

public class Document
{
    public int DocId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string FileType { get; set; } = string.Empty;
    public int UserId { get; set; }
    public int? CategoryId { get; set; }
    public DateTime UploadDate { get; set; } = DateTime.UtcNow;
    public bool IsVectorized { get; set; } = false;
    public string? ContentJson { get; set; }

    public User User { get; set; } = null!;
    public Category? Category { get; set; }
    public ICollection<DocumentTag> DocumentTags { get; set; } = [];
    public ICollection<Conversation> Conversations { get; set; } = [];
    public ICollection<MessageDocRef> MessageDocRefs { get; set; } = [];
    public ICollection<SharedLink> SharedLinks { get; set; } = [];
}

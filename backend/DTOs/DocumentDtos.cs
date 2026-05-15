namespace DocumentManagement.API.DTOs;

public record DocumentDto(
    int DocId, string Title, string FileType, long FileSize,
    DateTime UploadDate, bool IsVectorized, string? CategoryName,
    List<string> Tags);

public record NoteDto(int DocId, string Title, string? ContentJson, DateTime UploadDate, List<string> Tags);
public record SaveNoteRequest(string Title, string ContentJson, int? CategoryId);

public record UploadDocumentRequest(int? CategoryId);

public record ShareDocumentRequest(string RecipientEmail, string Permission);

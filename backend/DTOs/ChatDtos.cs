namespace DocumentManagement.API.DTOs;

public record ChatRequest(string Question, int DocId);
public record ChatMessage(string SenderType, string Content, DateTime SentAt);
public record SearchRequest(string Query);
public record SearchResult(int DocId, string Title, string FileType, string Snippet, double Score);

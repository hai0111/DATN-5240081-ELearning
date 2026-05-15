namespace DocumentManagement.API.DTOs;

public record ChatRequest(string Question, int DocId, int? ConvId = null);
public record ChatMessage(string SenderType, string Content, DateTime SentAt);
public record ConversationDto(int ConvId, int DocId, string DocTitle, string LastMessage, DateTime StartTime);
public record SearchRequest(string Query);
public record SearchResult(int DocId, string Title, string FileType, string Snippet, double Score);

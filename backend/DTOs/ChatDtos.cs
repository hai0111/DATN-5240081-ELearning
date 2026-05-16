namespace DocumentManagement.API.DTOs;

public record ChatRequest(string Question, int[] DocIds, int? ConvId = null);
public record ChatMessage(string SenderType, string Content, DateTime SentAt, int[] DocIds);
public record ConversationDto(int ConvId, string Title, string LastMessage, DateTime StartTime);
public record SearchRequest(string Query);
public record SearchResult(int DocId, string Title, string FileType, string Snippet, double Score);

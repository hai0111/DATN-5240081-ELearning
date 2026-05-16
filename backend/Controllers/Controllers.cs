using System.Security.Claims;
using DocumentManagement.API.Data;
using DocumentManagement.API.DTOs;
using DocumentManagement.API.Models;
using DocumentManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DocumentManagement.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        var result = await authService.LoginAsync(req);
        return result is null ? Unauthorized(new { message = "Thông tin đăng nhập không chính xác" }) : Ok(result);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest req)
    {
        var result = await authService.RegisterAsync(req);
        return result is null ? Conflict(new { message = "Email đã tồn tại" }) : Ok(result);
    }
}

[ApiController]
[Route("api/documents")]
[Authorize]
public class DocumentController(
    AppDbContext db,
    DocumentProcessingService processor,
    AiService ai,
    VectorStoreService vectorStore,
    IWebHostEnvironment env) : ControllerBase
{
    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var docs = await db.Documents
            .Where(d => d.UserId == CurrentUserId)
            .Include(d => d.Category)
            .Include(d => d.DocumentTags).ThenInclude(dt => dt.Tag)
            .Select(d => new DocumentDto(
                d.DocId, d.Title, d.FileType, d.FileSize, d.UploadDate, d.IsVectorized,
                d.Category != null ? d.Category.Name : null,
                d.DocumentTags.Select(dt => dt.Tag.TagName).ToList()))
            .ToListAsync();
        return Ok(docs);
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file, [FromForm] int? categoryId)
    {
        var allowed = new[] { ".pdf", ".txt", ".docx" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowed.Contains(ext))
            return BadRequest(new { message = "Định dạng không được hỗ trợ" });

        var fileName = $"{Guid.NewGuid()}{ext}";
        var uploadPath = Path.Combine(env.ContentRootPath, "Uploads");
        Directory.CreateDirectory(uploadPath);
        var filePath = Path.Combine(uploadPath, fileName);

        await using (var stream = System.IO.File.Create(filePath))
            await file.CopyToAsync(stream);

        var doc = new Document
        {
            Title = Path.GetFileNameWithoutExtension(file.FileName),
            FilePath = filePath,
            FileSize = file.Length,
            FileType = ext.TrimStart('.').ToUpper(),
            UserId = CurrentUserId,
            CategoryId = categoryId
        };
        db.Documents.Add(doc);
        await db.SaveChangesAsync();

        // Extract text & get AI tags
        var text = processor.ExtractText(filePath);
        List<string> suggestedTags = [];
        if (!string.IsNullOrWhiteSpace(text))
        {
            suggestedTags = await ai.GetSuggestedTagsAsync(text);

            // Vectorize and store
            var chunks = processor.ChunkText(text);
            for (int i = 0; i < chunks.Count; i++)
            {
                var vector = await ai.GetEmbeddingAsync(chunks[i]);
                vectorStore.Upsert(doc.DocId, i, vector, chunks[i]);
            }
            doc.IsVectorized = true;
            await db.SaveChangesAsync();
        }

        return Ok(new { doc.DocId, doc.Title, suggestedTags });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var doc = await db.Documents.FirstOrDefaultAsync(d => d.DocId == id && d.UserId == CurrentUserId);
        if (doc is null) return NotFound();

        if (System.IO.File.Exists(doc.FilePath))
            System.IO.File.Delete(doc.FilePath);

        vectorStore.DeleteByDocId(id);
        db.Documents.Remove(doc);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/tags")]
    public async Task<IActionResult> AddTag(int id, [FromBody] string tagName)
    {
        var doc = await db.Documents.FirstOrDefaultAsync(d => d.DocId == id && d.UserId == CurrentUserId);
        if (doc is null) return NotFound();

        var tag = await db.Tags.FirstOrDefaultAsync(t => t.TagName == tagName)
                  ?? new Tag { TagName = tagName };
        if (tag.TagId == 0) db.Tags.Add(tag);

        db.DocumentTags.Add(new DocumentTag { DocId = id, Tag = tag, IsAiSuggested = false });
        await db.SaveChangesAsync();
        return Ok();
    }

    [HttpGet("notes")]
    public async Task<IActionResult> GetNotes()
    {
        var notes = await db.Documents
            .Where(d => d.UserId == CurrentUserId && d.FileType == "note")
            .Include(d => d.DocumentTags).ThenInclude(dt => dt.Tag)
            .Select(d => new NoteDto(d.DocId, d.Title, d.ContentJson, d.UploadDate,
                d.DocumentTags.Select(dt => dt.Tag.TagName).ToList()))
            .ToListAsync();
        return Ok(notes);
    }

    [HttpPost("notes")]
    public async Task<IActionResult> CreateNote(SaveNoteRequest req)
    {
        var doc = new Document
        {
            Title = req.Title,
            FilePath = string.Empty,
            FileSize = 0,
            FileType = "note",
            ContentJson = req.ContentJson,
            UserId = CurrentUserId,
            CategoryId = req.CategoryId
        };
        db.Documents.Add(doc);
        await db.SaveChangesAsync();
        return Ok(new NoteDto(doc.DocId, doc.Title, doc.ContentJson, doc.UploadDate, []));
    }

    [HttpPut("notes/{id}")]
    public async Task<IActionResult> UpdateNote(int id, SaveNoteRequest req)
    {
        var doc = await db.Documents.FirstOrDefaultAsync(d => d.DocId == id && d.UserId == CurrentUserId && d.FileType == "note");
        if (doc is null) return NotFound();
        doc.Title = req.Title;
        doc.ContentJson = req.ContentJson;
        await db.SaveChangesAsync();
        return Ok(new NoteDto(doc.DocId, doc.Title, doc.ContentJson, doc.UploadDate, []));
    }

    [HttpPost("share")]
    public async Task<IActionResult> Share(ShareDocumentRequest req, [FromQuery] int docId)
    {
        var recipient = await db.Users.FirstOrDefaultAsync(u => u.Email == req.RecipientEmail);
        if (recipient is null) return NotFound(new { message = "Người dùng không tồn tại" });

        db.SharedLinks.Add(new SharedLink
        {
            DocId = docId,
            SharedWithId = recipient.UserId,
            Permission = req.Permission
        });
        await db.SaveChangesAsync();
        return Ok(new { message = "Chia sẻ thành công" });
    }
}

[ApiController]
[Route("api/chat")]
[Authorize]
public class ChatController(
    AppDbContext db,
    AiService ai,
    VectorStoreService vectorStore) : ControllerBase
{
    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost("ask")]
    public async Task AskStream(ChatRequest req, CancellationToken ct)
    {
        Response.Headers.Append("Content-Type", "text/event-stream");
        Response.Headers.Append("Cache-Control", "no-cache");

        // Vector search chỉ trên các doc được mention
        var queryVector = await ai.GetEmbeddingAsync(req.Question);
        var results = req.DocIds.Length > 0
            ? vectorStore.SearchByDocs(queryVector, req.DocIds, topK: 5)
            : [];
        var context = string.Join("\n\n", results.Select(r => r.Text));

        Conversation conv;
        if (req.ConvId.HasValue)
        {
            conv = await db.Conversations.FirstAsync(c => c.ConvId == req.ConvId && c.UserId == CurrentUserId);
        }
        else
        {
            conv = new Conversation { UserId = CurrentUserId, Title = req.Question[..Math.Min(60, req.Question.Length)] };
            db.Conversations.Add(conv);
        }

        var userMsg = new Message { Conversation = conv, SenderType = "User", Content = req.Question };
        foreach (var docId in req.DocIds)
            userMsg.DocRefs.Add(new MessageDocRef { DocId = docId });
        db.Messages.Add(userMsg);
        await db.SaveChangesAsync();

        // Send convId as first SSE event so client can track it
        await Response.WriteAsync($"event: conv\ndata: {conv.ConvId}\n\n", ct);
        await Response.Body.FlushAsync(ct);

        var fullResponse = new System.Text.StringBuilder();
        await foreach (var chunk in ai.StreamChatAsync(req.Question, context).WithCancellation(ct))
        {
            fullResponse.Append(chunk);
            await Response.WriteAsync($"data: {chunk}\n\n", ct);
            await Response.Body.FlushAsync(ct);
        }

        db.Messages.Add(new Message { ConvId = conv.ConvId, SenderType = "AI", Content = fullResponse.ToString() });
        await db.SaveChangesAsync();
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var convs = await db.Conversations
            .Where(c => c.UserId == CurrentUserId)
            .OrderByDescending(c => c.StartTime)
            .Select(c => new ConversationDto(
                c.ConvId, c.Title,
                c.Messages.OrderByDescending(m => m.SentAt).Select(m => m.Content).FirstOrDefault() ?? "",
                c.StartTime))
            .ToListAsync();
        return Ok(convs);
    }

    [HttpGet("conversations/{convId}")]
    public async Task<IActionResult> GetConversationMessages(int convId)
    {
        var messages = await db.Messages
            .Where(m => m.ConvId == convId && m.Conversation.UserId == CurrentUserId)
            .Include(m => m.DocRefs)
            .OrderBy(m => m.SentAt)
            .Select(m => new ChatMessage(
                m.SenderType, m.Content, m.SentAt,
                m.DocRefs.Select(r => r.DocId).ToArray()))
            .ToListAsync();
        return Ok(messages);
    }
}

[ApiController]
[Route("api/search")]
[Authorize]
public class SearchController(AiService ai, VectorStoreService vectorStore, AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        var queryVector = await ai.GetEmbeddingAsync(q);
        var results = vectorStore.Search(queryVector, topK: 10);

        var docIds = results.Select(r => r.DocId).Distinct().ToList();
        var docs = await db.Documents.Where(d => docIds.Contains(d.DocId))
            .ToDictionaryAsync(d => d.DocId);

        var response = results
            .Where(r => docs.ContainsKey(r.DocId))
            .Select(r => new SearchResult(
                r.DocId, docs[r.DocId].Title, docs[r.DocId].FileType,
                r.Text[..Math.Min(200, r.Text.Length)], r.Score))
            .ToList();

        return Ok(response);
    }
}

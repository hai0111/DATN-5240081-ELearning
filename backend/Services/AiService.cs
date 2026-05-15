using OpenAI;
using OpenAI.Chat;
using OpenAI.Embeddings;

namespace DocumentManagement.API.Services;

public class AiService(IConfiguration config)
{
    private readonly OpenAIClient _client = new(config["OpenAI:ApiKey"]!);
    private readonly string _chatModel = "gpt-4o-mini";
    private readonly string _embedModel = "text-embedding-3-small";

    public async Task<float[]> GetEmbeddingAsync(string text)
    {
        var client = _client.GetEmbeddingClient(_embedModel);
        var result = await client.GenerateEmbeddingAsync(text);
        return result.Value.ToFloats().ToArray();
    }

    public async Task<List<string>> GetSuggestedTagsAsync(string textContent)
    {
        var client = _client.GetChatClient(_chatModel);
        var prompt = $"Extract 3-5 relevant tags/keywords from this text. Return only a JSON array of strings.\n\nText: {textContent[..Math.Min(2000, textContent.Length)]}";
        var response = await client.CompleteChatAsync(prompt);
        var json = response.Value.Content[0].Text;
        try
        {
            return System.Text.Json.JsonSerializer.Deserialize<List<string>>(json) ?? [];
        }
        catch { return []; }
    }

    public async IAsyncEnumerable<string> StreamChatAsync(string question, string context)
    {
        var client = _client.GetChatClient(_chatModel);
        var systemPrompt = "Bạn là trợ lý quản lý tài liệu. Chỉ sử dụng thông tin trong phần [Context] để trả lời. Nếu không tìm thấy, hãy nói 'Thông tin không có trong tài liệu'. Tuyệt đối không tự bịa kiến thức bên ngoài.";
        var userPrompt = $"[Context]\n{context}\n\n[Question]\n{question}";

        var messages = new List<ChatMessage>
        {
            new SystemChatMessage(systemPrompt),
            new UserChatMessage(userPrompt)
        };

        await foreach (var update in client.CompleteChatStreamingAsync(messages))
            foreach (var part in update.ContentUpdate)
                if (!string.IsNullOrEmpty(part.Text))
                    yield return part.Text;
    }
}

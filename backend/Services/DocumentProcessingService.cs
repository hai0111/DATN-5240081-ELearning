using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;

namespace DocumentManagement.API.Services;

public class DocumentProcessingService
{
    private const int ChunkSize = 1000;
    private const int Overlap = 150;

    public string ExtractText(string filePath)
    {
        var ext = Path.GetExtension(filePath).ToLowerInvariant();
        return ext switch
        {
            ".pdf" => ExtractPdfText(filePath),
            ".txt" => File.ReadAllText(filePath),
            _ => string.Empty
        };
    }

    private static string ExtractPdfText(string filePath)
    {
        using var reader = new PdfReader(filePath);
        using var doc = new PdfDocument(reader);
        var sb = new System.Text.StringBuilder();
        for (int i = 1; i <= doc.GetNumberOfPages(); i++)
            sb.AppendLine(PdfTextExtractor.GetTextFromPage(doc.GetPage(i)));
        return sb.ToString();
    }

    public List<string> ChunkText(string text)
    {
        var chunks = new List<string>();
        var clean = System.Text.RegularExpressions.Regex.Replace(text, @"\s+", " ").Trim();
        int start = 0;
        while (start < clean.Length)
        {
            int end = Math.Min(start + ChunkSize, clean.Length);
            chunks.Add(clean[start..end]);
            start += ChunkSize - Overlap;
        }
        return chunks;
    }
}

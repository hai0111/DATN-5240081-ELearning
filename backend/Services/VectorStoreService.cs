namespace DocumentManagement.API.Services;

/// <summary>
/// In-memory vector store. Replace with Pinecone for production.
/// </summary>
public class VectorStoreService
{
    private readonly List<VectorEntry> _store = [];

    public void Upsert(int docId, int chunkIndex, float[] vector, string text)
    {
        _store.RemoveAll(e => e.DocId == docId && e.ChunkIndex == chunkIndex);
        _store.Add(new VectorEntry(docId, chunkIndex, vector, text));
    }

    public void DeleteByDocId(int docId) =>
        _store.RemoveAll(e => e.DocId == docId);

    public List<(int DocId, string Text, double Score)> Search(float[] queryVector, int topK = 3)
    {
        return _store
            .Select(e => (e.DocId, e.Text, Score: CosineSimilarity(queryVector, e.Vector)))
            .OrderByDescending(x => x.Score)
            .Take(topK)
            .ToList();
    }

    private static double CosineSimilarity(float[] a, float[] b)
    {
        double dot = 0, magA = 0, magB = 0;
        for (int i = 0; i < Math.Min(a.Length, b.Length); i++)
        {
            dot += a[i] * b[i];
            magA += a[i] * a[i];
            magB += b[i] * b[i];
        }
        return magA == 0 || magB == 0 ? 0 : dot / (Math.Sqrt(magA) * Math.Sqrt(magB));
    }

    private record VectorEntry(int DocId, int ChunkIndex, float[] Vector, string Text);
}

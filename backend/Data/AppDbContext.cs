using DocumentManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DocumentManagement.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<DocumentTag> DocumentTags => Set<DocumentTag>();
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<SharedLink> SharedLinks => Set<SharedLink>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Document>().HasKey(d => d.DocId);
        modelBuilder.Entity<DocumentTag>().HasKey(dt => new { dt.DocId, dt.TagId });
        modelBuilder.Entity<Conversation>().HasKey(c => c.ConvId);
        modelBuilder.Entity<Message>().HasKey(m => m.MessageId);
        modelBuilder.Entity<SharedLink>().HasKey(s => s.ShareId);
        modelBuilder.Entity<User>().HasKey(u => u.UserId);
        modelBuilder.Entity<Role>().HasKey(r => r.RoleId);
        modelBuilder.Entity<Category>().HasKey(c => c.CategoryId);
        modelBuilder.Entity<Tag>().HasKey(t => t.TagId);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email).IsUnique();

        modelBuilder.Entity<Tag>()
            .HasIndex(t => t.TagName).IsUnique();

        // Explicit relationships - fix cascade cycles for SQL Server
        modelBuilder.Entity<Document>()
            .HasOne(d => d.User).WithMany(u => u.Documents).HasForeignKey(d => d.UserId).OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Conversation>()
            .HasOne(c => c.User).WithMany(u => u.Conversations).HasForeignKey(c => c.UserId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Conversation>()
            .HasOne(c => c.Document).WithMany(d => d.Conversations).HasForeignKey(c => c.DocId).OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<SharedLink>()
            .HasOne(s => s.SharedWith).WithMany(u => u.SharedLinks).HasForeignKey(s => s.SharedWithId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<SharedLink>()
            .HasOne(s => s.Document).WithMany(d => d.SharedLinks).HasForeignKey(s => s.DocId).OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Message>()
            .HasOne(m => m.Conversation).WithMany(c => c.Messages).HasForeignKey(m => m.ConvId).OnDelete(DeleteBehavior.NoAction);

        // Seed roles
        modelBuilder.Entity<Role>().HasData(
            new Role { RoleId = 1, RoleName = "Admin" },
            new Role { RoleId = 2, RoleName = "User" }
        );
    }
}

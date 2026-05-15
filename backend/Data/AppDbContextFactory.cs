using DocumentManagement.API.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace DocumentManagement.API;

public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var opt = new DbContextOptionsBuilder<AppDbContext>();
        opt.UseSqlServer("Server=localhost;Database=DocumentManagementDB;Trusted_Connection=True;TrustServerCertificate=True;");
        return new AppDbContext(opt.Options);
    }
}

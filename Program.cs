using Microsoft.EntityFrameworkCore;
using CHA_CASA_NOVA_ADRIANA.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<CHA_CASA_NOVA_ADRIANAContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("CHA_CASA_NOVA_ADRIANAContext")
        ?? throw new InvalidOperationException("Connection string 'CHA_CASA_NOVA_ADRIANAContext' not found.")
    ));

builder.Services.AddControllersWithViews();

builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<CHA_CASA_NOVA_ADRIANAContext>();
    context.Database.Migrate();
    context.Database.ExecuteSqlRaw("""
        ALTER TABLE "Produto"
        ADD COLUMN IF NOT EXISTS "Categoria" character varying(50);
        """);
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseSession();
app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Produtos}/{action=Index}/{id?}")
    .WithStaticAssets();

app.Run();

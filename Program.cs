using Microsoft.EntityFrameworkCore;
using CHA_CASA_NOVA_ADRIANA.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<CHA_CASA_NOVA_ADRIANAContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("CHA_CASA_NOVA_ADRIANAContext")
        ?? throw new InvalidOperationException("Connection string 'CHA_CASA_NOVA_ADRIANAContext' not found.");

    if (string.IsNullOrWhiteSpace(connectionString))
    {
        throw new InvalidOperationException(
            "Connection string 'CHA_CASA_NOVA_ADRIANAContext' is empty. Configure 'ConnectionStrings__CHA_CASA_NOVA_ADRIANAContext' in the server or User Secrets locally.");
    }

    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 36)));
});

builder.Services.AddControllersWithViews();

builder.Services.AddMemoryCache();
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(20);
    options.Cookie.Name = "ChaCasaNova.Session";
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = CookieSecurePolicy.None;
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<CHA_CASA_NOVA_ADRIANAContext>();
    context.Database.Migrate();
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Produtos/Index");
    app.UseHsts();
}
app.UseStatusCodePagesWithReExecute("/Produtos/Index");

app.UseHttpsRedirection();

app.Use(async (context, next) =>
{
    context.Response.Headers.TryAdd("X-Content-Type-Options", "nosniff");
    context.Response.Headers.TryAdd("X-Frame-Options", "DENY");
    context.Response.Headers.TryAdd("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.TryAdd("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    await next();
});

app.UseRouting();

app.UseSession();
app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Produtos}/{action=Index}/{id?}")
    .WithStaticAssets();

app.Run();

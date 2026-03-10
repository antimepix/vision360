using System.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi;
using scrapperPlanning.Endpoints;
using scrapperPlanning.Data;
using scrapperPlanning.Services;
using scrapperPlanning.Services.Options;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.ApiKey,
        Name = "X-API-Key",
        In = ParameterLocation.Header,
        Description = "API key (ex: X-Api-Key: <TOKEN>)"
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("ApiKey", document, null),
            new List<string>()
        }
    });
});
builder.Services.AddHealthChecks();
builder.Services.Configure<AurionOptions>(builder.Configuration.GetSection("Aurion"));
builder.Services.Configure<ApiAuthOptions>(builder.Configuration.GetSection("ApiAuth"));

builder.Services.AddDbContext<AppDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("Default");
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        throw new InvalidOperationException("Connection string missing. Set ConnectionStrings:Default.");
    }
    options.UseNpgsql(connectionString);
});

builder.Services.AddHttpClient<AurionClient>((sp, client) =>
    {
        var options = sp.GetRequiredService<IOptions<AurionOptions>>().Value;
        client.BaseAddress = new Uri(options.BaseUrl);
        client.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36");
        client.DefaultRequestHeaders.Accept.ParseAdd("text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
        client.DefaultRequestHeaders.AcceptLanguage.ParseAdd("fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7");
    })
    .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
    {
        CookieContainer = new CookieContainer(),
        AutomaticDecompression = DecompressionMethods.All,
        AllowAutoRedirect = false
    });

builder.Services.AddScoped<RelationService>();
builder.Services.AddScoped<PlanningSyncService>();

var app = builder.Build();

app.MapHealthEndpoint();
app.MapPlanningSyncEndpoint();
app.MapPlanningDataEndpoints();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (app.Environment.IsDevelopment())
{
    app.Use(async (context, next) =>
    {
        if (!string.Equals(context.Request.Host.Host, "localhost", StringComparison.OrdinalIgnoreCase))
        {
            var port = context.Request.Host.Port;
            var portPart = port.HasValue ? $":{port.Value}" : string.Empty;
            var targetUrl = $"{context.Request.Scheme}://localhost{portPart}{context.Request.PathBase}{context.Request.Path}{context.Request.QueryString}";
            context.Response.Redirect(targetUrl, permanent: false);
            return;
        }

        await next();
    });
}

app.Use(async (context, next) =>
{
    var options = context.RequestServices.GetRequiredService<IOptions<ApiAuthOptions>>().Value;
    if (string.IsNullOrWhiteSpace(options.Token))
    {
        await next();
        return;
    }

    var path = context.Request.Path.Value ?? string.Empty;
    if (path.StartsWith("/health", StringComparison.OrdinalIgnoreCase) ||
        path.StartsWith("/swagger", StringComparison.OrdinalIgnoreCase))
    {
        await next();
        return;
    }

    var authHeader = context.Request.Headers.Authorization.ToString();
    var token = string.Empty;
    if (!string.IsNullOrWhiteSpace(authHeader) &&
        authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
    {
        token = authHeader["Bearer ".Length..].Trim();
    }
    else
    {
        token = context.Request.Headers["X-API-Key"].ToString();
    }

    if (!string.Equals(token, options.Token, StringComparison.Ordinal))
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        await context.Response.WriteAsJsonAsync(new { error = "Unauthorized" });
        return;
    }

    await next();
});

app.UseHttpsRedirection();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.Run();

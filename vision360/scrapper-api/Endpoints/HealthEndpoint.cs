using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using scrapperPlanning.Models.Output;

namespace scrapperPlanning.Endpoints;

public static class HealthEndpoint
{
    public static IEndpointRouteBuilder MapHealthEndpoint(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/health", async (HealthCheckService healthChecks, CancellationToken ct) =>
            {
                var report = await healthChecks.CheckHealthAsync(ct);
                var response = new HealthResponse(report.Status.ToString());
                var statusCode = report.Status == HealthStatus.Healthy
                    ? StatusCodes.Status200OK
                    : StatusCodes.Status503ServiceUnavailable;

                return Results.Json(response, statusCode: statusCode);
            })
            .WithName("GetHealth")
            .WithTags("Health")
            .Produces<HealthResponse>(StatusCodes.Status200OK)
            .Produces<HealthResponse>(StatusCodes.Status503ServiceUnavailable);

        return endpoints;
    }
}

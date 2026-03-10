using scrapperPlanning.Models.Input;
using scrapperPlanning.Models.Output;
using scrapperPlanning.Services;

namespace scrapperPlanning.Endpoints;

public static class PlanningSyncEndpoint
{
    public static IEndpointRouteBuilder MapPlanningSyncEndpoint(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost("/planning/sync", async (
                PlanningSyncRequest? request,
                PlanningSyncService service,
                HttpRequest httpRequest,
                ILoggerFactory loggerFactory,
                CancellationToken ct) =>
            {
                var logger = loggerFactory.CreateLogger("PlanningSync");
                try
                {
                    var result = await service.SyncAsync(request, ct);
                    return Results.Ok(result);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Planning sync failed");
                    return Results.Problem(
                        detail: ex.Message,
                        statusCode: StatusCodes.Status500InternalServerError);
                }
            })
            .WithName("PlanningSync")
            .WithTags("Planning")
            .Produces<PlanningSyncResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status500InternalServerError);

        return endpoints;
    }
}

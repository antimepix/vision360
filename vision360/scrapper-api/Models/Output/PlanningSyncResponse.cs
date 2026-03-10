namespace scrapperPlanning.Models.Output;

public sealed record PlanningSyncResponse(
    bool Success,
    string Message,
    int EventsFetched,
    int EventsInserted,
    double DurationSeconds);

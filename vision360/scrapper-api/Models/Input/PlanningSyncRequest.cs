namespace scrapperPlanning.Models.Input;

public sealed record PlanningSyncRequest(
    DateOnly? Date,
    int? SchoolYear);

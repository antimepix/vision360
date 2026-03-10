namespace scrapperPlanning.Services.Options;

public sealed class AurionOptions
{
    public string BaseUrl { get; init; } = "https://aurion.junia.com";
    public string Username { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public string SubmenuId { get; init; } = "3131476";
    public string MenuId { get; init; } = "0_0";
    public int PlanningRows { get; init; } = 1000;
}

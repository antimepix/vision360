using System.Diagnostics;
using System.Globalization;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Options;
using scrapperPlanning.Models.Dto;
using scrapperPlanning.Models.Input;
using scrapperPlanning.Models.Output;
using scrapperPlanning.Services.Options;

namespace scrapperPlanning.Services;

public sealed class PlanningSyncService
{
    private readonly AurionClient _aurionClient;
    private readonly RelationService _relationService;
    private readonly AurionOptions _aurionOptions;
    private readonly ILogger<PlanningSyncService> _logger;
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public PlanningSyncService(
        AurionClient aurionClient,
        RelationService relationService,
        ILogger<PlanningSyncService> logger,
        IOptions<AurionOptions> aurionOptions)
    {
        _aurionClient = aurionClient;
        _relationService = relationService;
        _logger = logger;
        _aurionOptions = aurionOptions.Value;
    }

    public async Task<PlanningSyncResponse> SyncAsync(PlanningSyncRequest? request, CancellationToken ct)
    {
        EnsureAurionConfigured();
        var timer = Stopwatch.StartNew();

        await _aurionClient.LoginAsync(ct);
        await _aurionClient.IndexAsync(allowRedirect: false, ct);
        await _aurionClient.SubMenuPageAsync(_aurionOptions.SubmenuId, ct);
        var planningPage = await _aurionClient.LoadPlanningPageAsync(_aurionOptions.MenuId, ct);
        var buttonId = AurionParser.GetButtonId(planningPage);
        if (string.IsNullOrWhiteSpace(buttonId))
        {
            throw new InvalidOperationException("Impossible de trouver le bouton de validation du planning.");
        }

        var xml = await _aurionClient.LoadMorePlanningPageAsync(false, 0, _aurionOptions.PlanningRows, ct);
        var planningIds = AurionParser.ExtractPlanningIdsFromXml(xml);
        await _aurionClient.ChoosePlanningAsync(planningIds, buttonId, ct);

        var insertedCount = 0;
        var fetchedCount = 0;
        var seen = new HashSet<string>();

        var isSchoolYearSync = request?.SchoolYear is not null;
        foreach (var date in ResolveSyncDates(request))
        {
            var weekStart = date.Date;
            var rangeDays = 7;
            var weekEnd = weekStart.AddDays(rangeDays).AddSeconds(-1);
            var startTimestamp = new DateTimeOffset(weekStart).ToUnixTimeMilliseconds();
            var endTimestamp = new DateTimeOffset(weekEnd).ToUnixTimeMilliseconds();
            var today = weekStart.ToString("dd/MM/yyyy", CultureInfo.GetCultureInfo("fr-FR"));
            var week = GetWeekNumber(weekStart).ToString("D2", CultureInfo.InvariantCulture);
            var year = weekStart.Year.ToString(CultureInfo.InvariantCulture);

            var planningXml = await _aurionClient.GetPlanningAsync(startTimestamp, endTimestamp, today, week, year, ct);
            var weekEvents = ExtractEvents(planningXml);
            weekEvents = AurionParser.GetUniqueEvents(weekEvents);

            fetchedCount += weekEvents.Count;

            foreach (var aurionEvent in weekEvents)
            {
                if (!seen.Add(aurionEvent.Id))
                {
                    continue;
                }

                if (await _relationService.PlanningEventExistsAsync(aurionEvent.Id, ct))
                {
                    continue;
                }

                var detailsXml = await _aurionClient.GetEventDetailsAsync(aurionEvent.Id, today, week, year, ct);
                aurionEvent.Students = AurionParser.ExtractStudentNames(detailsXml);
                aurionEvent.Lecturers = AurionParser.ExtractLecturerNames(detailsXml);
                aurionEvent.Resources = AurionParser.ExtractResources(detailsXml);
                aurionEvent.Groups = AurionParser.ExtractGroups(detailsXml);
                aurionEvent.Courses = AurionParser.ExtractCourses(detailsXml);

                var roomId = await _relationService.GetRoomIdAsync(aurionEvent.Resources, ct);
                var classes = await _relationService.GetClassesAsync(aurionEvent.Groups, ct);
                var students = await _relationService.GetStudentsAsync(aurionEvent.Students, ct);
                var lecturers = await _relationService.GetLecturersAsync(aurionEvent.Lecturers, ct);
                var courses = await _relationService.GetCoursesAsync(aurionEvent.Courses, ct);

                var planningEventId = await _relationService.CreateEventAsync(aurionEvent, roomId, ct);
                if (planningEventId is null)
                {
                    continue;
                }

                insertedCount++;

                await _relationService.LinkStudentsAsync(planningEventId.Value, students.Select(s => s.UserUuid), ct);
                await _relationService.LinkClassesAsync(planningEventId.Value, classes.Select(c => c.Id), ct);
                await _relationService.LinkLecturersAsync(planningEventId.Value, lecturers.Select(l => l.Id), ct);
                await _relationService.LinkCoursesAsync(planningEventId.Value, courses.Select(c => c.Id), ct);
            }
        }

        timer.Stop();
        return new PlanningSyncResponse(
            Success: true,
            Message: "Données récupérées avec succès",
            EventsFetched: fetchedCount,
            EventsInserted: insertedCount,
            DurationSeconds: Math.Round(timer.Elapsed.TotalSeconds, 2));
    }

    private List<AurionEventDto> ExtractEvents(string xml)
    {
        var updateMatch = Regex.Match(
            xml,
            "<update id=\"form:j_idt118\"><!\\[CDATA\\[(.*?)\\]\\]></update>",
            RegexOptions.Singleline);

        if (!updateMatch.Success)
        {
            return ExtractEventsFallback(xml);
        }

        var payload = updateMatch.Groups[1].Value;
        var jsonPayload = ExtractJsonObject(payload);
        if (string.IsNullOrWhiteSpace(jsonPayload))
        {
            _logger.LogWarning("Planning payload does not contain JSON object. Head: {Head}",
                payload.Length > 1200 ? payload[..1200] : payload);
            return [];
        }

        try
        {
            using var doc = JsonDocument.Parse(jsonPayload, new JsonDocumentOptions
            {
                AllowTrailingCommas = true,
                CommentHandling = JsonCommentHandling.Skip
            });

            if (doc.RootElement.ValueKind == JsonValueKind.Object &&
                doc.RootElement.TryGetProperty("events", out var eventsElement) &&
                eventsElement.ValueKind == JsonValueKind.Array)
            {
                var eventsJson = eventsElement.GetRawText();
                return JsonSerializer.Deserialize<List<AurionEventDto>>(eventsJson, _jsonOptions) ?? [];
            }
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to parse planning JSON. Head: {Head}",
                jsonPayload.Length > 1200 ? jsonPayload[..1200] : jsonPayload);
        }

        return [];
    }

    private List<AurionEventDto> ExtractEventsFallback(string xml)
    {
        var match = Regex.Match(xml, "\\[\\{\"id\"[\\s\\S]*?\\]\\]", RegexOptions.Singleline);
        if (!match.Success)
        {
            _logger.LogWarning("Planning data not found. Payload length: {Length}. Head: {Head}",
                xml.Length,
                xml.Length > 1200 ? xml[..1200] : xml);
            throw new InvalidOperationException("Planning data not found in response.");
        }

        var payload = match.Value.TrimEnd();
        while (payload.EndsWith("]]", StringComparison.Ordinal))
        {
            payload = payload[..^1];
        }

        return JsonSerializer.Deserialize<List<AurionEventDto>>(payload, _jsonOptions) ?? [];
    }

    private static string? ExtractJsonObject(string payload)
    {
        if (string.IsNullOrWhiteSpace(payload))
        {
            return null;
        }

        var start = payload.IndexOf('{');
        if (start < 0)
        {
            return null;
        }

        var end = payload.LastIndexOf('}');
        if (end <= start)
        {
            return null;
        }

        return payload[start..(end + 1)];
    }

    private static int GetWeekNumber(DateTime date)
    {
        var firstDayOfYear = new DateTime(date.Year, 1, 1);
        var pastDaysOfYear = (date - firstDayOfYear).TotalDays;
        return (int)Math.Ceiling((pastDaysOfYear + (int)firstDayOfYear.DayOfWeek + 1) / 7);
    }

    private IEnumerable<DateTime> ResolveSyncDates(PlanningSyncRequest? request)
    {
        if (request?.SchoolYear is { } schoolYear)
        {
            var start = new DateTime(schoolYear, 9, 1);
            var end = new DateTime(schoolYear + 1, 8, 31);
            for (var date = start; date <= end; date = date.AddDays(7))
            {
                yield return date;
            }

            yield break;
        }

        var dateValue = request?.Date?.ToDateTime(TimeOnly.MinValue) ?? DateTime.Today;
        
        // Align to Monday
        int diff = (7 + (dateValue.DayOfWeek - DayOfWeek.Monday)) % 7;
        var currentMonday = dateValue.AddDays(-1 * diff).Date;

        // Yield previous, current, and next week
        yield return currentMonday.AddDays(-7);
        yield return currentMonday;
        yield return currentMonday.AddDays(7);
    }

    private void EnsureAurionConfigured()
    {
        if (string.IsNullOrWhiteSpace(_aurionOptions.Username) ||
            string.IsNullOrWhiteSpace(_aurionOptions.Password))
        {
            throw new InvalidOperationException("Aurion configuration missing. Set Aurion:Username and Aurion:Password.");
        }
    }
}

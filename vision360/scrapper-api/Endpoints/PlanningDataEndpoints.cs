using Microsoft.EntityFrameworkCore;
using scrapperPlanning.Data;
using scrapperPlanning.Models.Output;

namespace scrapperPlanning.Endpoints;

public static class PlanningDataEndpoints
{
    public static IEndpointRouteBuilder MapPlanningDataEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/rooms", async (
                AppDbContext db,
                string? aurionCode,
                string? room,
                CancellationToken ct = default) =>
            {
                var query = db.Rooms.AsNoTracking();
                if (!string.IsNullOrWhiteSpace(aurionCode))
                {
                    query = query.Where(r => r.AurionCode == aurionCode);
                }

                if (!string.IsNullOrWhiteSpace(room))
                {
                    query = query.Where(r => r.Room != null && r.Room.Contains(room));
                }

                return await query
                    .OrderBy(r => r.Id)
                    .Select(r => new RoomResponse(r.Id, r.AurionCode, r.AurionRoom, r.Room, r.Capacity, r.Floor))
                    .ToListAsync(ct);
            })
            .WithTags("PlanningData");

        endpoints.MapGet("/classes", async (
                AppDbContext db,
                string? aurionCode,
                string? name,
                CancellationToken ct = default) =>
            {
                var query = db.Classes.AsNoTracking();
                if (!string.IsNullOrWhiteSpace(aurionCode))
                {
                    query = query.Where(c => c.AurionCode == aurionCode);
                }

                if (!string.IsNullOrWhiteSpace(name))
                {
                    query = query.Where(c => c.Name.Contains(name));
                }

                return await query
                    .OrderBy(c => c.Id)
                    .Select(c => new ClassResponse(c.Id, c.AurionCode, c.Name, c.AurionLabel))
                    .ToListAsync(ct);
            })
            .WithTags("PlanningData");

        endpoints.MapGet("/courses", async (
                AppDbContext db,
                string? aurionCode,
                string? course,
                string? module,
                CancellationToken ct = default) =>
            {
                var query = db.Courses.AsNoTracking();
                if (!string.IsNullOrWhiteSpace(aurionCode))
                {
                    query = query.Where(c => c.AurionCode == aurionCode);
                }

                if (!string.IsNullOrWhiteSpace(course))
                {
                    query = query.Where(c => c.Course != null && c.Course.Contains(course));
                }

                if (!string.IsNullOrWhiteSpace(module))
                {
                    query = query.Where(c => c.Module != null && c.Module.Contains(module));
                }

                return await query
                    .OrderBy(c => c.Id)
                    .Select(c => new CourseResponse(c.Id, c.AurionCode, c.Course, c.Module))
                    .ToListAsync(ct);
            })
            .WithTags("PlanningData");

        endpoints.MapGet("/lecturers", async (
                AppDbContext db,
                string? firstName,
                string? lastName,
                CancellationToken ct = default) =>
            {
                var query = db.Lecturers.AsNoTracking();
                if (!string.IsNullOrWhiteSpace(firstName))
                {
                    query = query.Where(l => l.FirstName.Contains(firstName));
                }

                if (!string.IsNullOrWhiteSpace(lastName))
                {
                    query = query.Where(l => l.LastName.Contains(lastName));
                }

                return await query
                    .OrderBy(l => l.Id)
                    .Select(l => new LecturerResponse(l.Id, l.FirstName, l.LastName))
                    .ToListAsync(ct);
            })
            .WithTags("PlanningData");

        endpoints.MapGet("/profiles", async (
                AppDbContext db,
                string? firstName,
                string? lastName,
                CancellationToken ct = default) =>
            {
                var query = db.Profiles.AsNoTracking();
                if (!string.IsNullOrWhiteSpace(firstName))
                {
                    query = query.Where(p => p.FirstName.Contains(firstName));
                }

                if (!string.IsNullOrWhiteSpace(lastName))
                {
                    query = query.Where(p => p.LastName.Contains(lastName));
                }

                return await query
                    .OrderBy(p => p.UserUuid)
                    .Select(p => new ProfileResponse(p.UserUuid, p.FirstName, p.LastName))
                    .ToListAsync(ct);
            })
            .WithTags("PlanningData");

        endpoints.MapGet("/planning/events", (Func<HttpContext, Task<IResult>>)(context =>
            WritePlanningEvents(context, null, null)))
            .WithTags("PlanningData");

        endpoints.MapGet("/planning/events/date/{date}", (Func<HttpContext, string, Task<IResult>>)(async (context, date) =>
        {
            if (!DateTime.TryParse(date, out var parsed))
            {
                return Results.BadRequest("Invalid date. Use YYYY-MM-DD.");
            }

            var start = parsed.Date;
            var end = parsed.Date.AddDays(1).AddSeconds(-1);
            return await WritePlanningEvents(context, start, end);
        }))
            .WithTags("PlanningData");

        // ─── Vision-360 formatted endpoint ──────────────────────────────────────
        // Returns events with ISO 8601 dates, full relation objects (lecturers, rooms,
        // groups, courses) — ready to merge into data.json without JS date conversion.
        endpoints.MapGet("/planning/events/vision360", async (
                AppDbContext db,
                CancellationToken ct = default) =>
            {
                var events = await db.PlanningEvents.AsNoTracking()
                    .OrderBy(e => e.StartTime)
                    .ToListAsync(ct);

                var eventIds = events.Select(e => e.Id).ToList();

                var classLinks = await db.PlanningEventClasses.AsNoTracking()
                    .Where(l => eventIds.Contains(l.PlanningEventId))
                    .ToListAsync(ct);
                var lecturerLinks = await db.PlanningEventLecturers.AsNoTracking()
                    .Where(l => eventIds.Contains(l.PlanningEventId))
                    .ToListAsync(ct);
                var courseLinks = await db.PlanningEventCourses.AsNoTracking()
                    .Where(l => eventIds.Contains(l.PlanningEventId))
                    .ToListAsync(ct);

                var classIds = classLinks.Select(l => l.ClassId).Distinct().ToList();
                var lecturerIds = lecturerLinks.Select(l => l.LecturerId).Distinct().ToList();
                var courseIdsList = courseLinks.Select(l => l.CourseId).Distinct().ToList();

                var rooms = await db.Rooms.AsNoTracking()
                    .ToDictionaryAsync(r => r.Id, ct);
                var classes = await db.Classes.AsNoTracking()
                    .Where(c => classIds.Contains(c.Id))
                    .ToDictionaryAsync(c => c.Id, ct);
                var lecturers = await db.Lecturers.AsNoTracking()
                    .Where(l => lecturerIds.Contains(l.Id))
                    .ToDictionaryAsync(l => l.Id, ct);
                var courses = await db.Courses.AsNoTracking()
                    .Where(c => courseIdsList.Contains(c.Id))
                    .ToDictionaryAsync(c => c.Id, ct);

                // Paris timezone (CET/CEST)
                var paris = TimeZoneInfo.FindSystemTimeZoneById("Europe/Paris");

                var result = events.Select(e =>
                {
                    var startDto = DateTimeOffset.FromUnixTimeMilliseconds(e.StartTime);
                    var endDto   = DateTimeOffset.FromUnixTimeMilliseconds(e.EndTime);

                    // Convert to Paris local time
                    var startParis = TimeZoneInfo.ConvertTime(startDto, paris);
                    var endParis   = TimeZoneInfo.ConvertTime(endDto, paris);

                    // ISO 8601 with explicit offset  e.g. "2026-03-10T08:30:00+0100"
                    static string ToIso(DateTimeOffset dto)
                    {
                        var offset = dto.Offset;
                        return dto.ToString("yyyy-MM-ddTHH:mm:ss") +
                               (offset < TimeSpan.Zero ? "-" : "+") +
                               offset.ToString(@"hhmm");
                    }

                    var evtRoomIds = e.IdRoom.HasValue && rooms.TryGetValue(e.IdRoom.Value, out var room)
                        ? new[] { new { code = room.AurionCode, label = room.Room ?? room.AurionRoom ?? "" } }
                        : Array.Empty<object>();

                    var evtClassIds = classLinks
                        .Where(l => l.PlanningEventId == e.Id && classes.TryGetValue(l.ClassId, out _))
                        .Select(l => classes[l.ClassId])
                        .Select(c => new { code = c.AurionCode, label = c.AurionLabel ?? c.Name })
                        .ToList();

                    var evtLecturerIds = lecturerLinks
                        .Where(l => l.PlanningEventId == e.Id && lecturers.TryGetValue(l.LecturerId, out _))
                        .Select(l => lecturers[l.LecturerId])
                        .Select(l => new { firstName = l.FirstName, lastName = l.LastName })
                        .ToList();

                    var evtCourseIds = courseLinks
                        .Where(l => l.PlanningEventId == e.Id && courses.TryGetValue(l.CourseId, out _))
                        .Select(l => courses[l.CourseId])
                        .Select(c => new { code = c.AurionCode, course = c.Course ?? "", module = c.Module ?? "" })
                        .ToList();

                    return new
                    {
                        id          = e.IdAurion,
                        title       = e.Title,
                        start       = ToIso(startParis),
                        end         = ToIso(endParis),
                        allDay      = false,
                        editable    = true,
                        className   = e.ClassName ?? "",
                        students    = Array.Empty<object>(),
                        lecturers   = evtLecturerIds,
                        resources   = evtRoomIds,
                        groups      = evtClassIds,
                        courses     = evtCourseIds,
                    };
                }).ToList();

                return Results.Ok(result);
            })
            .WithTags("PlanningData");

        return endpoints;
    }

    private static async Task<IResult> WritePlanningEvents(HttpContext context, DateTime? overrideStart, DateTime? overrideEnd)
    {
        var db = context.RequestServices.GetRequiredService<AppDbContext>();
        var request = context.Request;
        var ct = context.RequestAborted;

        DateTime? start;
        DateTime? end;

        if (overrideStart.HasValue || overrideEnd.HasValue)
        {
            start = overrideStart;
            end = overrideEnd;
        }
        else if (TryParseDateTime(request.Query["date"]) is { } singleDate)
        {
            start = singleDate.Date;
            end = singleDate.Date.AddDays(1).AddSeconds(-1);
        }
        else
        {
            var schoolYear = TryParseSchoolYear(request.Query["schoolYear"]);
            if (schoolYear.HasValue)
            {
                start = new DateTime(schoolYear.Value, 9, 1, 0, 0, 0, DateTimeKind.Local);
                end = new DateTime(schoolYear.Value + 1, 8, 31, 23, 59, 59, DateTimeKind.Local);
            }
            else
            {
                start = TryParseDateTime(request.Query["start"]);
                end = TryParseDateTime(request.Query["end"]);
            }
        }

        var includeRelations = bool.TryParse(request.Query["includeRelations"], out var include) && include;
        var idAurion = request.Query["idAurion"].ToString();
        var processed = TryParseBool(request.Query["processed"]);
        var className = request.Query["className"].ToString();
        var roomId = TryParseLong(request.Query["roomId"]);

        var query = db.PlanningEvents.AsNoTracking();
        if (start.HasValue)
        {
            var startMs = new DateTimeOffset(start.Value).ToUnixTimeMilliseconds();
            query = query.Where(e => e.StartTime >= startMs);
        }

        if (end.HasValue)
        {
            var endMs = new DateTimeOffset(end.Value).ToUnixTimeMilliseconds();
            query = query.Where(e => e.EndTime <= endMs);
        }

        if (!string.IsNullOrWhiteSpace(idAurion))
        {
            query = query.Where(e => e.IdAurion == idAurion);
        }

        if (processed.HasValue)
        {
            query = query.Where(e => e.Processed == processed.Value);
        }

        if (!string.IsNullOrWhiteSpace(className))
        {
            query = query.Where(e => e.ClassName != null && e.ClassName.Contains(className));
        }

        if (roomId.HasValue)
        {
            query = query.Where(e => e.IdRoom == roomId.Value);
        }

        if (!includeRelations)
        {
            var eventsResponse = await query
                .OrderBy(e => e.Id)
                .Select(e => new PlanningEventResponse(
                    e.Id,
                    e.StartTime,
                    e.EndTime,
                    e.Title,
                    e.IdAurion,
                    e.Processed,
                    e.ClassName,
                    e.IdRoom))
                .ToListAsync(ct);

            return Results.Ok(eventsResponse);
        }

        var events = await query
            .OrderBy(e => e.Id)
            .ToListAsync(ct);

        var eventIds = events.Select(e => e.Id).ToList();
        var classLinks = await db.PlanningEventClasses.AsNoTracking()
            .Where(link => eventIds.Contains(link.PlanningEventId))
            .ToListAsync(ct);
        var lecturerLinks = await db.PlanningEventLecturers.AsNoTracking()
            .Where(link => eventIds.Contains(link.PlanningEventId))
            .ToListAsync(ct);
        var courseLinks = await db.PlanningEventCourses.AsNoTracking()
            .Where(link => eventIds.Contains(link.PlanningEventId))
            .ToListAsync(ct);
        var userLinks = await db.PlanningEventUsers.AsNoTracking()
            .Where(link => eventIds.Contains(link.PlanningEventId))
            .ToListAsync(ct);

        var items = events.Select(e =>
        {
            var response = new PlanningEventResponse(
                e.Id,
                e.StartTime,
                e.EndTime,
                e.Title,
                e.IdAurion,
                e.Processed,
                e.ClassName,
                e.IdRoom);

            var classIds = classLinks.Where(l => l.PlanningEventId == e.Id).Select(l => l.ClassId).ToList();
            var lecturerIds = lecturerLinks.Where(l => l.PlanningEventId == e.Id).Select(l => l.LecturerId).ToList();
            var courseIds = courseLinks.Where(l => l.PlanningEventId == e.Id).Select(l => l.CourseId).ToList();
            var studentUuids = userLinks.Where(l => l.PlanningEventId == e.Id).Select(l => l.UserUuid).ToList();

            return new PlanningEventRelationsResponse(response, classIds, lecturerIds, courseIds, studentUuids);
        }).ToList();

        return Results.Ok(items);
    }

    private static DateTime? TryParseDateTime(string? value) =>
        DateTime.TryParse(value, out var parsed) ? parsed : null;

    private static int? TryParseSchoolYear(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        if (int.TryParse(value, out var year))
        {
            return year;
        }

        var parts = value.Split('-', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        if (parts.Length >= 1 && int.TryParse(parts[0], out var startYear))
        {
            return startYear;
        }

        return null;
    }

    private static bool? TryParseBool(string? value) =>
        bool.TryParse(value, out var parsed) ? parsed : null;

    private static long? TryParseLong(string? value) =>
        long.TryParse(value, out var parsed) ? parsed : null;
}

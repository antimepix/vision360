using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using scrapperPlanning.Data;
using scrapperPlanning.Models.Dto;
using scrapperPlanning.Models.Entities;

namespace scrapperPlanning.Services;

public sealed class RelationService
{
    private readonly AppDbContext _db;

    public RelationService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<long?> GetRoomIdAsync(List<ResourceDto> resources, CancellationToken ct)
    {
        if (resources.Count == 0)
        {
            return null;
        }

        var resource = resources[0];
        var existing = await _db.Rooms.FirstOrDefaultAsync(room => room.AurionCode == resource.Code, ct);
        if (existing is not null)
        {
            return existing.Id;
        }

        var room = new RoomEntity
        {
            AurionCode = resource.Code,
            AurionRoom = resource.Room ?? resource.Code,
            Room = resource.Label.Replace('_', ' '),
            Capacity = 0,
            Floor = 0
        };

        _db.Rooms.Add(room);
        await _db.SaveChangesAsync(ct);
        return room.Id;
    }

    public async Task<List<ClassEntity>> GetClassesAsync(List<GroupDto> groups, CancellationToken ct)
    {
        if (groups.Count == 0)
        {
            return [];
        }

        var codes = groups.Select(group => group.Code).ToList();
        var existing = await _db.Classes.Where(c => codes.Contains(c.AurionCode)).ToListAsync(ct);
        var existingCodes = new HashSet<string>(existing.Select(c => c.AurionCode));

        var missing = groups.Where(group => !existingCodes.Contains(group.Code)).ToList();
        if (missing.Count == 0)
        {
            return existing;
        }

        var newClasses = missing.Select(group => new ClassEntity
        {
            AurionCode = group.Code,
            Name = group.Label,
            AurionLabel = group.Label
        }).ToList();

        _db.Classes.AddRange(newClasses);
        await _db.SaveChangesAsync(ct);
        existing.AddRange(newClasses);
        return existing;
    }

    public async Task<List<CourseEntity>> GetCoursesAsync(List<CourseDto> courses, CancellationToken ct)
    {
        if (courses.Count == 0)
        {
            return [];
        }

        var codes = courses.Select(course => course.Code).ToList();
        var existing = await _db.Courses.Where(c => codes.Contains(c.AurionCode)).ToListAsync(ct);
        var existingCodes = new HashSet<string>(existing.Select(c => c.AurionCode));

        var missing = courses.Where(course => !existingCodes.Contains(course.Code)).ToList();
        if (missing.Count == 0)
        {
            return existing;
        }

        var newCourses = missing.Select(course => new CourseEntity
        {
            AurionCode = course.Code,
            Course = course.Course,
            Module = course.Module
        }).ToList();

        _db.Courses.AddRange(newCourses);
        await _db.SaveChangesAsync(ct);
        existing.AddRange(newCourses);
        return existing;
    }

    public async Task<List<ProfileEntity>> GetStudentsAsync(List<StudentDto> students, CancellationToken ct)
    {
        if (students.Count == 0)
        {
            return [];
        }

        var pairs = students.Select(s => (s.FirstName, s.LastName)).Distinct().ToList();
        var predicate = BuildProfilePredicate(pairs);
        var existing = await _db.Profiles.Where(predicate).ToListAsync(ct);

        var missing = students.Where(student =>
                !existing.Any(existingProfile =>
                    string.Equals(existingProfile.FirstName, student.FirstName, StringComparison.OrdinalIgnoreCase) &&
                    string.Equals(existingProfile.LastName, student.LastName, StringComparison.OrdinalIgnoreCase)))
            .GroupBy(s => new { s.FirstName, s.LastName })
            .Select(g => g.First())
            .ToList();

        if (missing.Count == 0)
        {
            return existing;
        }

        var newProfiles = missing.Select(student => new ProfileEntity
        {
            UserUuid = Guid.NewGuid(),
            FirstName = student.FirstName,
            LastName = student.LastName
        }).ToList();

        _db.Profiles.AddRange(newProfiles);
        await _db.SaveChangesAsync(ct);
        existing.AddRange(newProfiles);
        return existing;
    }

    public async Task<List<LecturerEntity>> GetLecturersAsync(List<LecturerDto> lecturers, CancellationToken ct)
    {
        if (lecturers.Count == 0)
        {
            return [];
        }

        var pairs = lecturers.Select(l => (l.FirstName, l.LastName)).Distinct().ToList();
        var predicate = BuildLecturerPredicate(pairs);
        var existing = await _db.Lecturers.Where(predicate).ToListAsync(ct);

        var missing = lecturers.Where(lecturer =>
                !existing.Any(existingLecturer =>
                    string.Equals(existingLecturer.FirstName, lecturer.FirstName, StringComparison.OrdinalIgnoreCase) &&
                    string.Equals(existingLecturer.LastName, lecturer.LastName, StringComparison.OrdinalIgnoreCase)))
            .ToList();

        if (missing.Count == 0)
        {
            return existing;
        }

        var newLecturers = missing.Select(lecturer => new LecturerEntity
        {
            FirstName = lecturer.FirstName,
            LastName = lecturer.LastName
        }).ToList();

        _db.Lecturers.AddRange(newLecturers);
        await _db.SaveChangesAsync(ct);
        existing.AddRange(newLecturers);
        return existing;
    }

    public async Task<long?> CreateEventAsync(
        AurionEventDto aurionEvent,
        long? roomId,
        CancellationToken ct)
    {
        var planningEvent = new PlanningEventEntity
        {
            StartTime = aurionEvent.Start,
            EndTime = aurionEvent.End,
            Title = aurionEvent.Title,
            IdAurion = aurionEvent.Id,
            Processed = false,
            ClassName = aurionEvent.ClassName,
            IdRoom = roomId
        };

        _db.PlanningEvents.Add(planningEvent);
        await _db.SaveChangesAsync(ct);
        return planningEvent.Id;
    }

    public Task<bool> PlanningEventExistsAsync(string idAurion, CancellationToken ct) =>
        _db.PlanningEvents.AnyAsync(e => e.IdAurion == idAurion, ct);

    public Task LinkStudentsAsync(long eventId, IEnumerable<Guid> studentUuids, CancellationToken ct) =>
        InsertLinksAsync(
            studentUuids.Select(id => new PlanningEventUserEntity
            {
                PlanningEventId = eventId,
                UserUuid = id
            }),
            ct);

    public Task LinkClassesAsync(long eventId, IEnumerable<long> classIds, CancellationToken ct) =>
        InsertLinksAsync(
            classIds.Select(id => new PlanningEventClassEntity
            {
                PlanningEventId = eventId,
                ClassId = id
            }),
            ct);

    public Task LinkLecturersAsync(long eventId, IEnumerable<long> lecturerIds, CancellationToken ct) =>
        InsertLinksAsync(
            lecturerIds.Select(id => new PlanningEventLecturerEntity
            {
                PlanningEventId = eventId,
                LecturerId = id
            }),
            ct);

    public Task LinkCoursesAsync(long eventId, IEnumerable<long> courseIds, CancellationToken ct) =>
        InsertLinksAsync(
            courseIds.Select(id => new PlanningEventCourseEntity
            {
                PlanningEventId = eventId,
                CourseId = id
            }),
            ct);

    private async Task InsertLinksAsync<TEntity>(IEnumerable<TEntity> entities, CancellationToken ct)
        where TEntity : class
    {
        var list = entities.ToList();
        if (list.Count == 0)
        {
            return;
        }

        _db.AddRange(list);
        await _db.SaveChangesAsync(ct);
    }

    private static Expression<Func<ProfileEntity, bool>> BuildProfilePredicate(
        IEnumerable<(string FirstName, string LastName)> items)
    {
        var param = Expression.Parameter(typeof(ProfileEntity), "p");
        Expression? body = null;
        var firstProp = Expression.Property(param, nameof(ProfileEntity.FirstName));
        var lastProp = Expression.Property(param, nameof(ProfileEntity.LastName));

        foreach (var (firstName, lastName) in items)
        {
            var condition = Expression.AndAlso(
                Expression.Equal(firstProp, Expression.Constant(firstName)),
                Expression.Equal(lastProp, Expression.Constant(lastName)));
            body = body is null ? condition : Expression.OrElse(body, condition);
        }

        body ??= Expression.Constant(false);
        return Expression.Lambda<Func<ProfileEntity, bool>>(body, param);
    }

    private static Expression<Func<LecturerEntity, bool>> BuildLecturerPredicate(
        IEnumerable<(string FirstName, string LastName)> items)
    {
        var param = Expression.Parameter(typeof(LecturerEntity), "l");
        Expression? body = null;
        var firstProp = Expression.Property(param, nameof(LecturerEntity.FirstName));
        var lastProp = Expression.Property(param, nameof(LecturerEntity.LastName));

        foreach (var (firstName, lastName) in items)
        {
            var condition = Expression.AndAlso(
                Expression.Equal(firstProp, Expression.Constant(firstName)),
                Expression.Equal(lastProp, Expression.Constant(lastName)));
            body = body is null ? condition : Expression.OrElse(body, condition);
        }

        body ??= Expression.Constant(false);
        return Expression.Lambda<Func<LecturerEntity, bool>>(body, param);
    }
}

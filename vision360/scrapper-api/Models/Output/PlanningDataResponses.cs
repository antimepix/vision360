namespace scrapperPlanning.Models.Output;

public sealed record RoomResponse(long Id, string AurionCode, string? AurionRoom, string? Room, int Capacity, int Floor);

public sealed record ClassResponse(long Id, string AurionCode, string Name, string? AurionLabel);

public sealed record CourseResponse(long Id, string AurionCode, string? Course, string? Module);

public sealed record LecturerResponse(long Id, string FirstName, string LastName);

public sealed record ProfileResponse(Guid UserUuid, string FirstName, string LastName);

public sealed record PlanningEventResponse(
    long Id,
    long StartTime,
    long EndTime,
    string Title,
    string IdAurion,
    bool Processed,
    string? ClassName,
    long? IdRoom);

public sealed record PlanningEventRelationsResponse(
    PlanningEventResponse Event,
    IReadOnlyList<long> ClassIds,
    IReadOnlyList<long> LecturerIds,
    IReadOnlyList<long> CourseIds,
    IReadOnlyList<Guid> StudentUuids);

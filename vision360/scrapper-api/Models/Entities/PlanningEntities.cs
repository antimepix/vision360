using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace scrapperPlanning.Models.Entities;

public sealed class RoomEntity
{
    [Key]
    public long Id { get; set; }

    [Required]
    public string AurionCode { get; set; } = string.Empty;

    public string? AurionRoom { get; set; }

    public string? Room { get; set; }

    public int Capacity { get; set; }

    public int Floor { get; set; }

    public List<PlanningEventEntity> PlanningEvents { get; set; } = new();
}

public sealed class ClassEntity
{
    [Key]
    public long Id { get; set; }

    [Required]
    public string AurionCode { get; set; } = string.Empty;

    [Required]
    public string Name { get; set; } = string.Empty;

    public string? AurionLabel { get; set; }

    public List<PlanningEventClassEntity> EventLinks { get; set; } = new();
}

public sealed class CourseEntity
{
    [Key]
    public long Id { get; set; }

    [Required]
    public string AurionCode { get; set; } = string.Empty;

    public string? Course { get; set; }

    public string? Module { get; set; }

    public List<PlanningEventCourseEntity> EventLinks { get; set; } = new();
}

public sealed class LecturerEntity
{
    [Key]
    public long Id { get; set; }

    [Required]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    public string LastName { get; set; } = string.Empty;

    public List<PlanningEventLecturerEntity> EventLinks { get; set; } = new();
}

public sealed class ProfileEntity
{
    [Key]
    public Guid UserUuid { get; set; }

    [Required]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    public string LastName { get; set; } = string.Empty;

    public List<PlanningEventUserEntity> EventLinks { get; set; } = new();
}

public sealed class PlanningEventEntity
{
    [Key]
    public long Id { get; set; }

    public long StartTime { get; set; }

    public long EndTime { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string IdAurion { get; set; } = string.Empty;

    public bool Processed { get; set; }

    public string? ClassName { get; set; }

    public long? IdRoom { get; set; }

    public RoomEntity? Room { get; set; }

    public List<PlanningEventClassEntity> ClassLinks { get; set; } = new();

    public List<PlanningEventUserEntity> UserLinks { get; set; } = new();

    public List<PlanningEventLecturerEntity> LecturerLinks { get; set; } = new();

    public List<PlanningEventCourseEntity> CourseLinks { get; set; } = new();
}

public sealed class PlanningEventClassEntity
{
    [Key]
    public long Id { get; set; }

    public long PlanningEventId { get; set; }

    public long ClassId { get; set; }

    public PlanningEventEntity? PlanningEvent { get; set; }

    public ClassEntity? Class { get; set; }
}

public sealed class PlanningEventUserEntity
{
    [Key]
    public long Id { get; set; }

    public long PlanningEventId { get; set; }

    public Guid UserUuid { get; set; }

    public PlanningEventEntity? PlanningEvent { get; set; }

    public ProfileEntity? Profile { get; set; }
}

public sealed class PlanningEventLecturerEntity
{
    [Key]
    public long Id { get; set; }

    public long PlanningEventId { get; set; }

    public long LecturerId { get; set; }

    public PlanningEventEntity? PlanningEvent { get; set; }

    public LecturerEntity? Lecturer { get; set; }
}

public sealed class PlanningEventCourseEntity
{
    [Key]
    public long Id { get; set; }

    public long PlanningEventId { get; set; }

    public long CourseId { get; set; }

    public PlanningEventEntity? PlanningEvent { get; set; }

    public CourseEntity? Course { get; set; }
}

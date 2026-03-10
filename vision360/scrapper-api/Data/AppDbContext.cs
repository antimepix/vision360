using Microsoft.EntityFrameworkCore;
using scrapperPlanning.Models.Entities;

namespace scrapperPlanning.Data;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<RoomEntity> Rooms => Set<RoomEntity>();
    public DbSet<ClassEntity> Classes => Set<ClassEntity>();
    public DbSet<CourseEntity> Courses => Set<CourseEntity>();
    public DbSet<LecturerEntity> Lecturers => Set<LecturerEntity>();
    public DbSet<ProfileEntity> Profiles => Set<ProfileEntity>();
    public DbSet<PlanningEventEntity> PlanningEvents => Set<PlanningEventEntity>();
    public DbSet<PlanningEventClassEntity> PlanningEventClasses => Set<PlanningEventClassEntity>();
    public DbSet<PlanningEventUserEntity> PlanningEventUsers => Set<PlanningEventUserEntity>();
    public DbSet<PlanningEventLecturerEntity> PlanningEventLecturers => Set<PlanningEventLecturerEntity>();
    public DbSet<PlanningEventCourseEntity> PlanningEventCourses => Set<PlanningEventCourseEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<RoomEntity>(entity =>
        {
            entity.ToTable("Room");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.AurionCode).IsUnique();
        });

        modelBuilder.Entity<ClassEntity>(entity =>
        {
            entity.ToTable("Class");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.AurionCode).IsUnique();
        });

        modelBuilder.Entity<CourseEntity>(entity =>
        {
            entity.ToTable("Courses");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.AurionCode).IsUnique();
        });

        modelBuilder.Entity<LecturerEntity>(entity =>
        {
            entity.ToTable("Lecturers");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.FirstName, e.LastName }).IsUnique();
        });

        modelBuilder.Entity<ProfileEntity>(entity =>
        {
            entity.ToTable("Profiles");
            entity.HasKey(e => e.UserUuid);
            entity.HasIndex(e => new { e.FirstName, e.LastName });
        });

        modelBuilder.Entity<PlanningEventEntity>(entity =>
        {
            entity.ToTable("PlanningEvents");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.IdAurion);
            entity.HasOne(e => e.Room)
                .WithMany(r => r.PlanningEvents)
                .HasForeignKey(e => e.IdRoom)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<PlanningEventClassEntity>(entity =>
        {
            entity.ToTable("PlanningEvents_Classes");
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.PlanningEvent)
                .WithMany(p => p.ClassLinks)
                .HasForeignKey(e => e.PlanningEventId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Class)
                .WithMany(c => c.EventLinks)
                .HasForeignKey(e => e.ClassId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlanningEventUserEntity>(entity =>
        {
            entity.ToTable("PlanningEvents_Users");
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.PlanningEvent)
                .WithMany(p => p.UserLinks)
                .HasForeignKey(e => e.PlanningEventId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Profile)
                .WithMany(p => p.EventLinks)
                .HasForeignKey(e => e.UserUuid)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlanningEventLecturerEntity>(entity =>
        {
            entity.ToTable("PlanningEvents_Lecturers");
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.PlanningEvent)
                .WithMany(p => p.LecturerLinks)
                .HasForeignKey(e => e.PlanningEventId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Lecturer)
                .WithMany(l => l.EventLinks)
                .HasForeignKey(e => e.LecturerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlanningEventCourseEntity>(entity =>
        {
            entity.ToTable("PlanningEvents_Courses");
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.PlanningEvent)
                .WithMany(p => p.CourseLinks)
                .HasForeignKey(e => e.PlanningEventId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Course)
                .WithMany(c => c.EventLinks)
                .HasForeignKey(e => e.CourseId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}

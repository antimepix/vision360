using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace scrapperPlanning.Migrations
{
    /// <inheritdoc />
    public partial class InitialPlanningSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Class",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AurionCode = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    AurionLabel = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Class", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Courses",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AurionCode = table.Column<string>(type: "text", nullable: false),
                    Course = table.Column<string>(type: "text", nullable: true),
                    Module = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Courses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Lecturers",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FirstName = table.Column<string>(type: "text", nullable: false),
                    LastName = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Lecturers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Profiles",
                columns: table => new
                {
                    UserUuid = table.Column<Guid>(type: "uuid", nullable: false),
                    FirstName = table.Column<string>(type: "text", nullable: false),
                    LastName = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Profiles", x => x.UserUuid);
                });

            migrationBuilder.CreateTable(
                name: "Room",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AurionCode = table.Column<string>(type: "text", nullable: false),
                    AurionRoom = table.Column<string>(type: "text", nullable: true),
                    Room = table.Column<string>(type: "text", nullable: true),
                    Capacity = table.Column<int>(type: "integer", nullable: false),
                    Floor = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Room", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PlanningEvents",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StartTime = table.Column<long>(type: "bigint", nullable: false),
                    EndTime = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    IdAurion = table.Column<string>(type: "text", nullable: false),
                    Processed = table.Column<bool>(type: "boolean", nullable: false),
                    ClassName = table.Column<string>(type: "text", nullable: true),
                    IdRoom = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanningEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlanningEvents_Room_IdRoom",
                        column: x => x.IdRoom,
                        principalTable: "Room",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "PlanningEvents_Classes",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PlanningEventId = table.Column<long>(type: "bigint", nullable: false),
                    ClassId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanningEvents_Classes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlanningEvents_Classes_Class_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Class",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PlanningEvents_Classes_PlanningEvents_PlanningEventId",
                        column: x => x.PlanningEventId,
                        principalTable: "PlanningEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlanningEvents_Courses",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PlanningEventId = table.Column<long>(type: "bigint", nullable: false),
                    CourseId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanningEvents_Courses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlanningEvents_Courses_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PlanningEvents_Courses_PlanningEvents_PlanningEventId",
                        column: x => x.PlanningEventId,
                        principalTable: "PlanningEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlanningEvents_Lecturers",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PlanningEventId = table.Column<long>(type: "bigint", nullable: false),
                    LecturerId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanningEvents_Lecturers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlanningEvents_Lecturers_Lecturers_LecturerId",
                        column: x => x.LecturerId,
                        principalTable: "Lecturers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PlanningEvents_Lecturers_PlanningEvents_PlanningEventId",
                        column: x => x.PlanningEventId,
                        principalTable: "PlanningEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlanningEvents_Users",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PlanningEventId = table.Column<long>(type: "bigint", nullable: false),
                    UserUuid = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanningEvents_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlanningEvents_Users_PlanningEvents_PlanningEventId",
                        column: x => x.PlanningEventId,
                        principalTable: "PlanningEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PlanningEvents_Users_Profiles_UserUuid",
                        column: x => x.UserUuid,
                        principalTable: "Profiles",
                        principalColumn: "UserUuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Class_AurionCode",
                table: "Class",
                column: "AurionCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Courses_AurionCode",
                table: "Courses",
                column: "AurionCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Lecturers_FirstName_LastName",
                table: "Lecturers",
                columns: new[] { "FirstName", "LastName" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PlanningEvents_IdAurion",
                table: "PlanningEvents",
                column: "IdAurion");

            migrationBuilder.CreateIndex(
                name: "IX_PlanningEvents_IdRoom",
                table: "PlanningEvents",
                column: "IdRoom");

            migrationBuilder.CreateIndex(
                name: "IX_PlanningEvents_Classes_ClassId",
                table: "PlanningEvents_Classes",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_PlanningEvents_Classes_PlanningEventId",
                table: "PlanningEvents_Classes",
                column: "PlanningEventId");

            migrationBuilder.CreateIndex(
                name: "IX_PlanningEvents_Courses_CourseId",
                table: "PlanningEvents_Courses",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_PlanningEvents_Courses_PlanningEventId",
                table: "PlanningEvents_Courses",
                column: "PlanningEventId");

            migrationBuilder.CreateIndex(
                name: "IX_PlanningEvents_Lecturers_LecturerId",
                table: "PlanningEvents_Lecturers",
                column: "LecturerId");

            migrationBuilder.CreateIndex(
                name: "IX_PlanningEvents_Lecturers_PlanningEventId",
                table: "PlanningEvents_Lecturers",
                column: "PlanningEventId");

            migrationBuilder.CreateIndex(
                name: "IX_PlanningEvents_Users_PlanningEventId",
                table: "PlanningEvents_Users",
                column: "PlanningEventId");

            migrationBuilder.CreateIndex(
                name: "IX_PlanningEvents_Users_UserUuid",
                table: "PlanningEvents_Users",
                column: "UserUuid");

            migrationBuilder.CreateIndex(
                name: "IX_Profiles_FirstName_LastName",
                table: "Profiles",
                columns: new[] { "FirstName", "LastName" });

            migrationBuilder.CreateIndex(
                name: "IX_Room_AurionCode",
                table: "Room",
                column: "AurionCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PlanningEvents_Classes");

            migrationBuilder.DropTable(
                name: "PlanningEvents_Courses");

            migrationBuilder.DropTable(
                name: "PlanningEvents_Lecturers");

            migrationBuilder.DropTable(
                name: "PlanningEvents_Users");

            migrationBuilder.DropTable(
                name: "Class");

            migrationBuilder.DropTable(
                name: "Courses");

            migrationBuilder.DropTable(
                name: "Lecturers");

            migrationBuilder.DropTable(
                name: "PlanningEvents");

            migrationBuilder.DropTable(
                name: "Profiles");

            migrationBuilder.DropTable(
                name: "Room");
        }
    }
}

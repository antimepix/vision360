-- Tables required for the planning sync feature (PostgreSQL)

create table if not exists "Room" (
  id bigserial primary key,
  aurionCode text not null,
  aurionRoom text,
  room text,
  capacity integer not null default 0,
  floor integer not null default 0
);

create unique index if not exists "Room_aurionCode_idx" on "Room" ("aurionCode");

create table if not exists "Class" (
  id bigserial primary key,
  aurionCode text not null,
  name text not null,
  aurionLabel text
);

create unique index if not exists "Class_aurionCode_idx" on "Class" ("aurionCode");

create table if not exists "Courses" (
  id bigserial primary key,
  aurionCode text not null,
  course text,
  module text
);

create unique index if not exists "Courses_aurionCode_idx" on "Courses" ("aurionCode");

create table if not exists "Lecturers" (
  id bigserial primary key,
  firstName text not null,
  lastName text not null
);

create unique index if not exists "Lecturers_name_idx" on "Lecturers" ("firstName", "lastName");

create table if not exists "Profiles" (
  userUuid uuid primary key,
  firstName text not null,
  lastName text not null
);

create index if not exists "Profiles_name_idx" on "Profiles" ("firstName", "lastName");

create table if not exists "PlanningEvents" (
  id bigserial primary key,
  startTime bigint not null,
  endTime bigint not null,
  title text not null,
  idAurion text not null,
  processed boolean not null default false,
  className text,
  idRoom bigint references "Room" (id) on delete set null
);

create index if not exists "PlanningEvents_idAurion_idx" on "PlanningEvents" ("idAurion");

create table if not exists "PlanningEvents_Classes" (
  id bigserial primary key,
  planningEventId bigint not null references "PlanningEvents" (id) on delete cascade,
  classId bigint not null references "Class" (id) on delete cascade
);

create table if not exists "PlanningEvents_Users" (
  id bigserial primary key,
  planningEventId bigint not null references "PlanningEvents" (id) on delete cascade,
  userUuid uuid not null references "Profiles" (userUuid) on delete cascade
);

create table if not exists "PlanningEvents_Lecturers" (
  id bigserial primary key,
  planningEventId bigint not null references "PlanningEvents" (id) on delete cascade,
  lecturerId bigint not null references "Lecturers" (id) on delete cascade
);

create table if not exists "PlanningEvents_Courses" (
  id bigserial primary key,
  planningEventId bigint not null references "PlanningEvents" (id) on delete cascade,
  courseId bigint not null references "Courses" (id) on delete cascade
);

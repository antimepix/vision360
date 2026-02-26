import http from "k6/http";
import { check, group, sleep } from "k6";

export const options = {
  stages: [
    { duration: "20s", target: 10 },
    { duration: "40s", target: 10 },
    { duration: "20s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<800"], // ajuste selon ta machine
  },
};

const API_URL = __ENV.API_URL || "http://localhost:3001";

function pad2(n) {
  return String(n).padStart(2, "0");
}
function ymd(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function addDays(d, days) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function setup() {
  // On récupère quelques IDs d'events pour tester /api/events/:id et /students
  const seed = http.get(`${API_URL}/api/db/events?limit=20`, { tags: { name: "seed_db_events" } });
  const ids = [];

  if (seed.status === 200) {
    const events = seed.json("events") || [];
    for (const e of events) {
      const id = e?.ID ?? e?.id;
      if (id) ids.push(id);
    }
  }

  return { ids };
}

export default function (data) {
  const now = new Date();
  const start = ymd(addDays(now, -7));
  const end = ymd(addDays(now, 7));
  const qStudents = pick(["du", "an", "ma", "le", "sa"]);
  const qRooms = pick(["J", "B", "A", "C"]);

  group("health", () => {
    const r = http.get(`${API_URL}/api/health`, { tags: { name: "api_health" } });
    check(r, { "health 200": (x) => x.status === 200 });
  });

  group("resources list", () => {
    const r = http.get(`${API_URL}/api/resources?q=${encodeURIComponent(qRooms)}&limit=50`, {
      tags: { name: "api_resources" },
    });
    check(r, { "resources 200": (x) => x.status === 200 });
  });

  group("students search", () => {
    const r = http.get(`${API_URL}/api/students?q=${encodeURIComponent(qStudents)}&limit=50`, {
      tags: { name: "api_students" },
    });
    check(r, { "students 200": (x) => x.status === 200 });
  });

  group("events in range", () => {
    const r = http.get(`${API_URL}/api/events?start=${start}&end=${end}&limit=200`, {
      tags: { name: "api_events_range" },
    });
    check(r, { "events range 200": (x) => x.status === 200 });
  });

  if (data?.ids?.length) {
    const id = pick(data.ids);

    group("event details", () => {
      const r = http.get(`${API_URL}/api/events/${id}`, { tags: { name: "api_event_detail" } });
      check(r, { "event detail 200/404": (x) => x.status === 200 || x.status === 404 });
    });

    group("event students", () => {
      const r = http.get(`${API_URL}/api/events/${id}/students?limit=200`, {
        tags: { name: "api_event_students" },
      });
      check(r, { "event students 200/404": (x) => x.status === 200 || x.status === 404 });
    });
  }

  sleep(1);
}
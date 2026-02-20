// Utility functions for room data processing

export function extractRoomNumber(labelOrCode) {
    const match = String(labelOrCode ?? "").match(/\d+/);
    return match ? match[0] : null;
}

export function getRoomColor(status) {
    return status === "libre" ? "#4ade80" : "#ef4444";
}

/**
 * Maps raw room data and events to processed room objects with coordinates and status.
 */
export function buildRoomData(rooms, overrides, events) {
    return rooms.map((room, idx) => {
        const ov = overrides[room.id] || {};

        // Fallback coordinates
        const xPct = ov.xPercent ?? room.xPercent ?? 10 + (idx % 4) * 22;
        const yPct = ov.yPercent ?? room.yPercent ?? 10 + Math.floor(idx / 4) * 25;
        const wPct = ov.widthPercent ?? room.widthPercent ?? 12;
        const hPct = ov.heightPercent ?? room.heightPercent ?? 12;
        const alias = ov.alias ?? null;

        const roomNumber = String(room.id || "").replace("salle", "");

        // Check for events in this room
        const event = events.find((ev) =>
            (ev.resources ?? []).some((res) => {
                const num = extractRoomNumber(res.label ?? res.code);
                return num && num === roomNumber;
            })
        );

        const base = {
            ...room,
            xPercent: xPct,
            yPercent: yPct,
            widthPercent: wPct,
            heightPercent: hPct,
            alias,
            displayName: alias || room.name,
        };

        if (!event) {
            return { ...base, status: "libre", morning: "libre", afternoon: "libre" };
        }

        const startHour = new Date(event.start).getHours();
        const endHour = new Date(event.end).getHours();

        return {
            ...base,
            status: "utilisee",
            morning: startHour < 12 ? "occupee" : "libre",
            afternoon: endHour > 12 ? "occupee" : "libre",
        };
    });
}

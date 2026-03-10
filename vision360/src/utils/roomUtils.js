// Utility functions for room data processing

import { 
    overlaps, 
    roomShort 
} from "./appUtils";

export function extractRoomNumber(labelOrCode) {
    const match = String(labelOrCode ?? "").match(/\d+/);
    return match ? match[0] : null;
}

const PERIODS = {
    matin: { startMin: 8 * 60, endMin: 13 * 60 },
    aprem: { startMin: 13 * 60, endMin: 19 * 60 },
};

/**
 * Maps raw room data and events to processed room objects with coordinates and status.
 */
export function buildRoomData(baseRooms, overrides, events) {
    const processedRooms = baseRooms
        .filter((room) => !overrides[room.id]?.isDeleted)
        .map((room, idx) => {
            const ov = overrides[room.id] || {};

            const xPct = ov.xPercent ?? room.xPercent ?? 10 + (idx % 4) * 22;
            const yPct = ov.yPercent ?? room.yPercent ?? 10 + Math.floor(idx / 4) * 25;
            const wPct = ov.widthPercent ?? room.widthPercent ?? 12;
            const hPct = ov.heightPercent ?? room.heightPercent ?? 12;
            const rotation = ov.rotation ?? room.rotation ?? 0;
            const alias = ov.alias ?? null;

            // Simplified room matching, using both id and maybe alias
            const myRoomShort = roomShort(room.id);

            const dayEventsInRoom = events.filter((ev) =>
                (ev.resources ?? []).some((res) => {
                    const rLabel = roomShort(res.label ?? res.code);
                    // Match if same or if one is numeric-suffix of the other (e.g. 101 and J101)
                    return rLabel === myRoomShort || 
                           rLabel.endsWith(myRoomShort) || 
                           myRoomShort.endsWith(rLabel);
                })
            );

            const hasMatin = dayEventsInRoom.some(e => overlaps(e, PERIODS.matin));
            const hasAprem = dayEventsInRoom.some(e => overlaps(e, PERIODS.aprem));

            const currentHour = new Date().getHours();
            const isCurrentlyOccupied = currentHour < 13 ? hasMatin : hasAprem;

            const base = {
                ...room,
                xPercent: xPct,
                yPercent: yPct,
                widthPercent: wPct,
                heightPercent: hPct,
                rotation,
                alias,
                displayName: alias || room.name,
            };

            return {
                ...base,
                status: isCurrentlyOccupied ? "utilisee" : "libre",
                morning: hasMatin ? "occupee" : "libre",
                afternoon: hasAprem ? "occupee" : "libre",
            };
        });

    const customRoomIds = Object.keys(overrides).filter(
        (id) => !baseRooms.some((r) => r.id === id) && overrides[id].isCustom && !overrides[id].isDeleted
    );

    customRoomIds.forEach((id) => {
        const ov = overrides[id];
        const myRoomShort = roomShort(ov.alias || id);
        
        const dayEventsInRoom = events.filter((ev) =>
            (ev.resources ?? []).some((res) => {
                const rLabel = roomShort(res.label ?? res.code);
                // Match if same or if one is numeric-suffix of the other (e.g. 101 and J101)
                return rLabel === myRoomShort || 
                       rLabel.endsWith(myRoomShort) || 
                       myRoomShort.endsWith(rLabel);
            })
        );

        const hasMatin = dayEventsInRoom.some(e => overlaps(e, PERIODS.matin));
        const hasAprem = dayEventsInRoom.some(e => overlaps(e, PERIODS.aprem));

        const currentHour = new Date().getHours();
        const isCurrentlyOccupied = currentHour < 13 ? hasMatin : hasAprem;

        processedRooms.push({
            id,
            name: ov.alias || "Nouvelle salle",
            displayName: ov.alias || "Nouvelle salle",
            alias: ov.alias || null,
            xPercent: ov.xPercent ?? 50,
            yPercent: ov.yPercent ?? 50,
            widthPercent: ov.widthPercent ?? 12,
            heightPercent: ov.heightPercent ?? 10,
            rotation: ov.rotation ?? 0,
            status: isCurrentlyOccupied ? "utilisee" : "libre",
            morning: hasMatin ? "occupee" : "libre",
            afternoon: hasAprem ? "occupee" : "libre",
            isCustom: true,
        });
    });

    return processedRooms;
}

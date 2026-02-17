// Utility functions for localStorage management of room overrides

export function getStorageKey() {
    const role = localStorage.getItem("userRole") || "guest";
    return `campus-room-overrides-${role}`;
}

export function loadOverrides() {
    try {
        return JSON.parse(localStorage.getItem(getStorageKey())) || {};
    } catch {
        return {};
    }
}

export function saveOverrides(overrides) {
    localStorage.setItem(getStorageKey(), JSON.stringify(overrides));
}

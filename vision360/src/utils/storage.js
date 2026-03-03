// Utility functions for localStorage management of room overrides

export function getStorageKey() {
    const accessCode = localStorage.getItem("accessCode");
    const role = localStorage.getItem("userRole") || "guest";
    const id = accessCode || role;
    return `campus-room-overrides-${id}`;
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

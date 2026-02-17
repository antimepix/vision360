// Permissions configuration for each user role

export const PERMISSIONS = {
    damien: ["/", "/schedule", "/campus", "/presence"],
    eleve: ["/campus", "/schedule"],
    admin: ["/", "/schedule", "/presence"],
};

export function isPathAllowed(role, path) {
    const allowedPaths = PERMISSIONS[role] || [];
    return allowedPaths.includes(path);
}

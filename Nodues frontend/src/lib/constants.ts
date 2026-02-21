export const DEPARTMENTS = [
    "Computer Science",
    "Information Technology",
    "Electronics Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Chemical Engineering",
    "Architecture",
    "Management",
] as const;

export type Department = typeof DEPARTMENTS[number];

export const OFFICE_NAMES: Record<string, string> = {
    Faculty: "Faculty",
    ClassCoordinator: "Class Coordinator",
    HOD: "HOD",
    HostelWarden: "Hostel Administration",
    LibraryAdmin: "Library",
    WorkshopAdmin: "Workshop/Lab",
    TPOfficer: "Training & Placement Cell",
    GeneralOffice: "General Office",
    AccountsOfficer: "Accounts Office",
};

export const ROLES = [
    "Student",
    "Faculty",
    "ClassCoordinator",
    "HOD",
    "HostelWarden",
    "LibraryAdmin",
    "WorkshopAdmin",
    "TPOfficer",
    "GeneralOffice",
    "AccountsOfficer",
    "SuperAdmin",
] as const;

export type Role = typeof ROLES[number];

export interface Student {
    id: string | number;
    regId: string;
    name: string;
    email: string;
    batch: string;
    admissionDate: string;
    daysWaiting: number;
    suggestedMentor?: string;
    assignedMentor?: string | null;
    program: 'Foundation Course' | 'Lakshya' | 'Dakshya' | 'Optional' | string;
    mode?: 'Online' | 'Offline';
    category?: 'Full time' | 'College' | 'Working';
    performance?: 'Excellent' | 'Very Good' | 'Good' | 'Average' | 'Poor';
    activityStatus?: 'Active' | 'Inactive';
    inactiveDays?: number;
    contactNo?: string;
    reassignmentReason?: string;
}

export interface Mentor {
    id: string;
    name: string;
    email: string;
    currentLoad: number;
    capacity: number;
    status: 'Available' | 'Near Limit' | 'Full';
    department: string;
    allocatedPrograms: string[];
}

export interface AuditLog {
    id: string;
    timestamp: string;
    studentRegId: string;
    fromMentor: string | null;
    toMentor: string;
    actionType: 'Assigned' | 'Reassigned';
    reason?: string;
}

export interface KPI {
    title: string;
    value: string | number;
    subtext: string;
    trend?: 'up' | 'down' | 'neutral';
    alert?: boolean;
}

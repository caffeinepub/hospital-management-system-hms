import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Notification {
    id: bigint;
    userId: Principal;
    seen: boolean;
    message: string;
    timestamp: Time;
}
export interface Doctor {
    id: Principal;
    name: string;
    specialty: string;
}
export interface Nurse {
    id: Principal;
    name: string;
    department: string;
}
export interface Appointment {
    id: bigint;
    status: AppointmentStatus;
    doctorId: Principal;
    patientId: Principal;
    notes: string;
    dateTime: Time;
}
export interface UserProfile {
    age?: bigint;
    appRole: AppRole;
    name: string;
    specialty?: string;
    department?: string;
}
export interface Patient {
    id: Principal;
    age: bigint;
    name: string;
}
export enum AppRole {
    patient = "patient",
    admin = "admin",
    doctor = "doctor",
    nurse = "nurse"
}
export enum AppointmentStatus {
    scheduled = "scheduled",
    cancelled = "cancelled",
    completed = "completed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addDoctor(doctor: Doctor): Promise<void>;
    addNotification(userId: Principal, message: string): Promise<void>;
    addNurse(nurse: Nurse): Promise<void>;
    assignAppRole(user: Principal, role: AppRole): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bookAppointment(doctorId: Principal, dateTime: Time): Promise<bigint>;
    cancelAppointment(appointmentId: bigint): Promise<void>;
    getAppointment(appointmentId: bigint): Promise<Appointment | null>;
    getAppointmentStats(): Promise<{
        scheduled: bigint;
        total: bigint;
        cancelled: bigint;
        completed: bigint;
    }>;
    getAppointmentsForDoctor(doctorId: Principal): Promise<Array<Appointment>>;
    getAppointmentsForPatient(patientId: Principal): Promise<Array<Appointment>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<{
        totalPatients: bigint;
        totalNurses: bigint;
        totalDoctors: bigint;
        totalAppointments: bigint;
    }>;
    getDoctor(doctorId: Principal): Promise<Doctor | null>;
    getDoctors(): Promise<Array<Doctor>>;
    getNotifications(userId: Principal): Promise<Array<Notification>>;
    getNurse(nurseId: Principal): Promise<Nurse | null>;
    getNurses(): Promise<Array<Nurse>>;
    getPatient(patientId: Principal): Promise<Patient | null>;
    getPatients(): Promise<Array<Patient>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markNotificationSeen(userId: Principal, notificationId: bigint): Promise<void>;
    registerPatient(patient: Patient): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedData(): Promise<void>;
    updateAppointmentStatus(appointmentId: bigint, status: AppointmentStatus, notes: string): Promise<void>;
}

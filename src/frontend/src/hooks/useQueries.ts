import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Doctor, Patient, Appointment, Notification, AppRole, AppointmentStatus, Nurse } from '../backend';
import { Principal } from '@dfinity/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Doctor Queries
export function useGetDoctors() {
  const { actor, isFetching } = useActor();

  return useQuery<Doctor[]>({
    queryKey: ['doctors'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDoctors();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetDoctor(doctorId?: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<Doctor | null>({
    queryKey: ['doctor', doctorId?.toString()],
    queryFn: async () => {
      if (!actor || !doctorId) return null;
      return actor.getDoctor(doctorId);
    },
    enabled: !!actor && !isFetching && !!doctorId,
  });
}

export function useAddDoctor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doctor: Doctor) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addDoctor(doctor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

// Nurse Queries
export function useGetNurses() {
  const { actor, isFetching } = useActor();

  return useQuery<Nurse[]>({
    queryKey: ['nurses'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNurses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetNurse(nurseId?: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<Nurse | null>({
    queryKey: ['nurse', nurseId?.toString()],
    queryFn: async () => {
      if (!actor || !nurseId) return null;
      return actor.getNurse(nurseId);
    },
    enabled: !!actor && !isFetching && !!nurseId,
  });
}

export function useAddNurse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nurse: Nurse) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addNurse(nurse);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nurses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

// Patient Queries
export function useGetPatients() {
  const { actor, isFetching } = useActor();

  return useQuery<Patient[]>({
    queryKey: ['patients'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPatients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPatient(patientId?: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<Patient | null>({
    queryKey: ['patient', patientId?.toString()],
    queryFn: async () => {
      if (!actor || !patientId) return null;
      return actor.getPatient(patientId);
    },
    enabled: !!actor && !isFetching && !!patientId,
  });
}

export function useRegisterPatient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patient: Patient) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerPatient(patient);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

// Appointment Queries
export function useGetAppointmentsForPatient(patientId?: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<Appointment[]>({
    queryKey: ['appointments', 'patient', patientId?.toString()],
    queryFn: async () => {
      if (!actor || !patientId) return [];
      return actor.getAppointmentsForPatient(patientId);
    },
    enabled: !!actor && !isFetching && !!patientId,
  });
}

export function useGetAppointmentsForDoctor(doctorId?: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<Appointment[]>({
    queryKey: ['appointments', 'doctor', doctorId?.toString()],
    queryFn: async () => {
      if (!actor || !doctorId) return [];
      return actor.getAppointmentsForDoctor(doctorId);
    },
    enabled: !!actor && !isFetching && !!doctorId,
  });
}

export function useGetAppointment(appointmentId?: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Appointment | null>({
    queryKey: ['appointment', appointmentId?.toString()],
    queryFn: async () => {
      if (!actor || appointmentId === undefined) return null;
      return actor.getAppointment(appointmentId);
    },
    enabled: !!actor && !isFetching && appointmentId !== undefined,
  });
}

export function useBookAppointment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ doctorId, dateTime }: { doctorId: Principal; dateTime: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bookAppointment(doctorId, dateTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      status,
      notes,
    }: {
      appointmentId: bigint;
      status: AppointmentStatus;
      notes: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAppointmentStatus(appointmentId, status, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment'] });
    },
  });
}

export function useCancelAppointment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.cancelAppointment(appointmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

// Notification Queries
export function useGetNotifications(userId?: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<Notification[]>({
    queryKey: ['notifications', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getNotifications(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useMarkNotificationSeen() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, notificationId }: { userId: Principal; notificationId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markNotificationSeen(userId, notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Admin Queries
export function useGetDashboardStats() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAppointmentStats() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['appointmentStats'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAppointmentStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAssignAppRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: AppRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignAppRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Demo Data Seeding
export function useSeedDemoStaff() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.seedData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['nurses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

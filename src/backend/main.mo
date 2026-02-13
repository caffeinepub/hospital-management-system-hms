import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  // APPLICATION ROLES (mapped to AccessControl roles)
  type AppRole = {
    #patient;
    #doctor;
    #nurse;
    #admin;
  };

  // USER PROFILE (required by frontend)
  public type UserProfile = {
    name : Text;
    appRole : AppRole;
    age : ?Nat; // Only for patients
    specialty : ?Text; // Only for doctors
    department : ?Text; // Only for nurses
  };

  // DOCTOR TYPE
  public type Doctor = {
    id : Principal;
    name : Text;
    specialty : Text;
  };

  module Doctor {
    public func compare(doctor1 : Doctor, doctor2 : Doctor) : Order.Order {
      switch (Text.compare(doctor1.name, doctor2.name)) {
        case (#equal) { Text.compare(doctor1.specialty, doctor2.specialty) };
        case (order) { order };
      };
    };
  };

  // NURSE TYPE
  public type Nurse = {
    id : Principal;
    name : Text;
    department : Text;
  };

  module Nurse {
    public func compare(nurse1 : Nurse, nurse2 : Nurse) : Order.Order {
      switch (Text.compare(nurse1.name, nurse2.name)) {
        case (#equal) { Text.compare(nurse1.department, nurse2.department) };
        case (order) { order };
      };
    };
  };

  // PATIENT TYPE
  public type Patient = {
    id : Principal;
    name : Text;
    age : Nat;
  };

  module Patient {
    public func compare(patient1 : Patient, patient2 : Patient) : Order.Order {
      switch (Text.compare(patient1.name, patient2.name)) {
        case (#equal) {
          Nat.compare(patient1.age, patient2.age);
        };
        case (order) { order };
      };
    };
  };

  // APPOINTMENT STATUS
  public type AppointmentStatus = {
    #scheduled;
    #completed;
    #cancelled;
  };

  // APPOINTMENT TYPE
  public type Appointment = {
    id : Nat;
    patientId : Principal;
    doctorId : Principal;
    dateTime : Time.Time;
    status : AppointmentStatus;
    notes : Text;
  };

  module Appointment {
    public func compare(appointment1 : Appointment, appointment2 : Appointment) : Order.Order {
      Int.compare(appointment1.dateTime, appointment2.dateTime);
    };
  };

  // NOTIFICATION TYPE
  public type Notification = {
    id : Nat;
    userId : Principal;
    message : Text;
    timestamp : Time.Time;
    seen : Bool;
  };

  module Notification {
    public func compare(notification1 : Notification, notification2 : Notification) : Order.Order {
      Int.compare(notification1.timestamp, notification2.timestamp);
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();
  let doctors = Map.empty<Principal, Doctor>();
  let patients = Map.empty<Principal, Patient>();
  let nurses = Map.empty<Principal, Nurse>();
  let appointments = Map.empty<Nat, Appointment>();
  let notifications = Map.empty<Principal, List.List<Notification>>();
  var nextAppointmentId = 0;
  var nextNotificationId = 0;

  func getAppRole(principal : Principal) : ?AppRole {
    switch (userProfiles.get(principal)) {
      case (?profile) { ?profile.appRole };
      case (null) { null };
    };
  };

  func isPatient(principal : Principal) : Bool {
    switch (getAppRole(principal)) {
      case (?#patient) { true };
      case (_) { false };
    };
  };

  func isDoctor(principal : Principal) : Bool {
    switch (getAppRole(principal)) {
      case (?#doctor) { true };
      case (_) { false };
    };
  };

  func isAppAdmin(principal : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, principal);
  };

  // USER PROFILE MANAGEMENT (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be registered user");
    };
    userProfiles.add(caller, profile);

    switch (profile.appRole) {
      case (#doctor) {
        let specialty = switch (profile.specialty) {
          case (?s) { s };
          case (null) { "" };
        };
        doctors.add(caller, {
          id = caller;
          name = profile.name;
          specialty;
        });
      };
      case (#nurse) {
        let department = switch (profile.department) {
          case (?d) { d };
          case (null) { "" };
        };
        nurses.add(caller, {
          id = caller;
          name = profile.name;
          department;
        });
      };
      case (#patient) {
        let age = switch (profile.age) {
          case (?a) { a };
          case (null) { 0 };
        };
        patients.add(caller, {
          id = caller;
          name = profile.name;
          age;
        });
      };
      case (#admin) {};
    };
  };

  // ROLE ASSIGNMENT (admin only)
  public shared ({ caller }) func assignAppRole(user : Principal, role : AppRole) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can assign roles");
    };

    AccessControl.assignRole(accessControlState, caller, user, #user);

    let existingProfile = userProfiles.get(user);
    let newProfile = switch (existingProfile) {
      case (?profile) {
        {
          name = profile.name;
          appRole = role;
          age = profile.age;
          specialty = profile.specialty;
          department = profile.department;
        };
      };
      case (null) {
        {
          name = "";
          appRole = role;
          age = null;
          specialty = null;
          department = null;
        };
      };
    };
    userProfiles.add(user, newProfile);
  };

  // DOCTOR MANAGEMENT
  public shared ({ caller }) func addDoctor(doctor : Doctor) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add doctors");
    };
    doctors.add(doctor.id, doctor);

    let profile : UserProfile = {
      name = doctor.name;
      appRole = #doctor;
      age = null;
      specialty = ?doctor.specialty;
      department = null;
    };
    userProfiles.add(doctor.id, profile);
    AccessControl.assignRole(accessControlState, caller, doctor.id, #user);
  };

  // NURSE MANAGEMENT (new)
  public shared ({ caller }) func addNurse(nurse : Nurse) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add nurses");
    };
    nurses.add(nurse.id, nurse);

    let profile : UserProfile = {
      name = nurse.name;
      appRole = #nurse;
      age = null;
      specialty = null;
      department = ?nurse.department;
    };
    userProfiles.add(nurse.id, profile);
    AccessControl.assignRole(accessControlState, caller, nurse.id, #user);
  };

  public query ({ caller }) func getDoctors() : async [Doctor] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view doctors");
    };
    doctors.values().toArray().sort();
  };

  public query ({ caller }) func getDoctor(doctorId : Principal) : async ?Doctor {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view doctor details");
    };
    doctors.get(doctorId);
  };

  // NURSE MANAGEMENT (new)
  public query ({ caller }) func getNurses() : async [Nurse] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view nurses");
    };
    nurses.values().toArray().sort();
  };

  public query ({ caller }) func getNurse(nurseId : Principal) : async ?Nurse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view nurse details");
    };
    nurses.get(nurseId);
  };

  // PATIENT MANAGEMENT
  public shared ({ caller }) func registerPatient(patient : Patient) : async () {
    if (caller != patient.id and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only register yourself");
    };

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be authenticated user");
    };

    patients.add(patient.id, patient);

    let profile : UserProfile = {
      name = patient.name;
      appRole = #patient;
      age = ?patient.age;
      specialty = null;
      department = null;
    };
    userProfiles.add(patient.id, profile);
  };

  public query ({ caller }) func getPatients() : async [Patient] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all patients");
    };
    patients.values().toArray().sort();
  };

  public query ({ caller }) func getPatient(patientId : Principal) : async ?Patient {
    if (caller != patientId and not isDoctor(caller) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Insufficient permissions to view patient");
    };
    patients.get(patientId);
  };

  // APPOINTMENTS
  public shared ({ caller }) func bookAppointment(doctorId : Principal, dateTime : Time.Time) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be authenticated to book appointments");
    };

    if (not isPatient(caller)) {
      Runtime.trap("Unauthorized: Only patients can book appointments");
    };

    switch (doctors.get(doctorId)) {
      case (null) { Runtime.trap("Invalid input: Doctor not found") };
      case (?_) {};
    };

    let appointment = {
      id = nextAppointmentId;
      patientId = caller;
      doctorId;
      dateTime;
      status = #scheduled;
      notes = "";
    };

    appointments.add(nextAppointmentId, appointment);
    let appointmentId = nextAppointmentId;
    nextAppointmentId += 1;
    appointmentId;
  };

  public query ({ caller }) func getAppointmentsForPatient(patientId : Principal) : async [Appointment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };

    if (caller != patientId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own appointments");
    };

    appointments.values().toArray().filter(
      func(app : Appointment) : Bool {
        app.patientId == patientId;
      }
    ).sort();
  };

  public query ({ caller }) func getAppointmentsForDoctor(doctorId : Principal) : async [Appointment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };

    if (isDoctor(caller) and doctorId != caller) {
      Runtime.trap("Unauthorized: Doctors can only view their own appointments");
    };

    if (not isDoctor(caller) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only doctors and admins can view doctor appointments");
    };

    appointments.values().toArray().filter(
      func(app : Appointment) : Bool {
        app.doctorId == doctorId;
      }
    ).sort();
  };

  public query ({ caller }) func getAppointment(appointmentId : Nat) : async ?Appointment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };

    switch (appointments.get(appointmentId)) {
      case (?appointment) {
        if (caller != appointment.patientId and caller != appointment.doctorId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own appointments");
        };
        ?appointment;
      };
      case (null) { null };
    };
  };

  public shared ({ caller }) func updateAppointmentStatus(appointmentId : Nat, status : AppointmentStatus, notes : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };

    switch (appointments.get(appointmentId)) {
      case (?appointment) {
        if (caller != appointment.doctorId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the assigned doctor or admin can update appointment");
        };

        let updatedAppointment = {
          id = appointment.id;
          patientId = appointment.patientId;
          doctorId = appointment.doctorId;
          dateTime = appointment.dateTime;
          status;
          notes;
        };
        appointments.add(appointmentId, updatedAppointment);
      };
      case (null) {
        Runtime.trap("Not found: Appointment does not exist");
      };
    };
  };

  public shared ({ caller }) func cancelAppointment(appointmentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };

    switch (appointments.get(appointmentId)) {
      case (?appointment) {
        if (caller != appointment.patientId and caller != appointment.doctorId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only cancel your own appointments");
        };

        let updatedAppointment = {
          id = appointment.id;
          patientId = appointment.patientId;
          doctorId = appointment.doctorId;
          dateTime = appointment.dateTime;
          status = #cancelled;
          notes = appointment.notes;
        };
        appointments.add(appointmentId, updatedAppointment);
      };
      case (null) {
        Runtime.trap("Not found: Appointment does not exist");
      };
    };
  };

  // NOTIFICATIONS
  public shared ({ caller }) func addNotification(userId : Principal, message : Text) : async () {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only add notifications for yourself or as admin");
    };

    let newNotification = {
      id = nextNotificationId;
      userId;
      message;
      timestamp = Time.now();
      seen = false;
    };
    nextNotificationId += 1;

    switch (notifications.get(userId)) {
      case (null) {
        let newNotificationList = List.empty<Notification>();
        newNotificationList.add(newNotification);
        notifications.add(userId, newNotificationList);
      };
      case (?existingNotifications) {
        existingNotifications.add(newNotification);
      };
    };
  };

  public query ({ caller }) func getNotifications(userId : Principal) : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };

    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own notifications");
    };

    let filteredNotifications = switch (notifications.get(userId)) {
      case (null) { List.empty<Notification>() };
      case (?existingNotifications) { existingNotifications };
    };
    filteredNotifications.toArray().sort();
  };

  public shared ({ caller }) func markNotificationSeen(userId : Principal, notificationId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };

    if (caller != userId) {
      Runtime.trap("Unauthorized: Can only mark your own notifications");
    };

    switch (notifications.get(userId)) {
      case (?userNotifications) {
        let updatedList = List.empty<Notification>();
        for (notif in userNotifications.toArray().values()) {
          if (notif.id == notificationId) {
            updatedList.add({
              id = notif.id;
              userId = notif.userId;
              message = notif.message;
              timestamp = notif.timestamp;
              seen = true;
            });
          } else {
            updatedList.add(notif);
          };
        };
        notifications.add(userId, updatedList);
      };
      case (null) {
        Runtime.trap("Not found: No notifications for user");
      };
    };
  };

  // ADMIN ANALYTICS
  public query ({ caller }) func getAppointmentStats() : async {
    total : Nat;
    scheduled : Nat;
    completed : Nat;
    cancelled : Nat;
  } {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view statistics");
    };

    var scheduled = 0;
    var completed = 0;
    var cancelled = 0;

    for (appointment in appointments.values()) {
      switch (appointment.status) {
        case (#scheduled) { scheduled += 1 };
        case (#completed) { completed += 1 };
        case (#cancelled) { cancelled += 1 };
      };
    };

    {
      total = appointments.size();
      scheduled;
      completed;
      cancelled;
    };
  };

  public query ({ caller }) func getDashboardStats() : async {
    totalDoctors : Nat;
    totalNurses : Nat;
    totalPatients : Nat;
    totalAppointments : Nat;
  } {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view dashboard statistics");
    };

    {
      totalDoctors = doctors.size();
      totalNurses = nurses.size();
      totalPatients = patients.size();
      totalAppointments = appointments.size();
    };
  };

  // DATA SEEDING (admin only)
  public shared ({ caller }) func seedData() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can seed data");
    };

    // Seed doctors
    let demoDoctors = [
      (Principal.fromText("doctor1"), {
        id = Principal.fromText("doctor1");
        name = "Dr. John Smith";
        specialty = "Cardiology";
      }),
      (Principal.fromText("doctor2"), {
        id = Principal.fromText("doctor2");
        name = "Dr. Jane Doe";
        specialty = "Pediatrics";
      }),
    ];

    for (doctor in demoDoctors.values()) {
      if (not doctors.containsKey(doctor.0)) {
        await addDoctor(doctor.1);
      };
    };

    // Seed nurses
    let demoNurses = [
      (Principal.fromText("nurse1"), {
        id = Principal.fromText("nurse1");
        name = "Nurse Alice Brown";
        department = "Emergency";
      }),
      (Principal.fromText("nurse2"), {
        id = Principal.fromText("nurse2");
        name = "Nurse Bob White";
        department = "Cardiology";
      }),
    ];

    for (nurse in demoNurses.values()) {
      if (not nurses.containsKey(nurse.0)) {
        await addNurse(nurse.1);
      };
    };
  };
};

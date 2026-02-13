import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // Legacy types
  type OldAppRole = {
    #patient;
    #doctor;
    #admin;
  };
  type OldUserProfile = {
    name : Text;
    appRole : OldAppRole;
    age : ?Nat;
    specialty : ?Text;
  };

  // Old actor state
  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  // New types
  type NewAppRole = {
    #patient;
    #doctor;
    #nurse;
    #admin;
  };
  type NewUserProfile = {
    name : Text;
    appRole : NewAppRole;
    age : ?Nat;
    specialty : ?Text;
    department : ?Text;
  };

  // New actor state
  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  // Map old AppRole to new AppRole (adding nurse support)
  func migrateAppRole(old : OldAppRole) : NewAppRole {
    switch (old) {
      case (#doctor) { #doctor };
      case (#patient) { #patient };
      case (#admin) { #admin };
    };
  };

  // Map old UserProfile to new UserProfile with nurse support
  func migrateUserProfile(old : OldUserProfile) : NewUserProfile {
    {
      name = old.name;
      appRole = migrateAppRole(old.appRole);
      age = old.age;
      specialty = old.specialty;
      department = null; // Old profiles have no department yet
    };
  };

  // Migrate entire system state
  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_, oldUserProfile) {
        migrateUserProfile(oldUserProfile);
      }
    );
    { userProfiles = newUserProfiles };
  };
};

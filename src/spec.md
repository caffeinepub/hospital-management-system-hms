# Specification

## Summary
**Goal:** Add nurse staff records alongside doctors, plus admin tools to manage nurses and seed demo staff for testing.

**Planned changes:**
- Extend backend data model/state with a Nurse type and admin-only APIs to add and list nurses, including creating/updating a corresponding UserProfile with nurse role/permissions.
- Add an admin-only backend method to seed deterministic demo staff (at least 2 doctors and 2 nurses) without duplicating records on repeated runs.
- Add an admin UI panel to list and add nurses (table + “Add Nurse” dialog), integrated into the Admin Dashboard.
- Add an Admin Dashboard control to trigger demo staff seeding with loading state, toasts, and automatic refresh of doctors/nurses lists.

**User-visible outcome:** Admins can view and add nurses from the dashboard and can seed demo doctors and nurses with a single action for quick demos/testing.

import { TextField } from "./form";

interface Props {
  parentName: string;
  householdName: string;
  onParentName: (value: string) => void;
  onHouseholdName: (value: string) => void;
}

/**
 * The "Your name" + "Family name" pair shared by the SignUp and Onboarding
 * (/setup) household-creation forms, so the two stay in lockstep.
 */
export function HouseholdFields({
  parentName,
  householdName,
  onParentName,
  onHouseholdName,
}: Props) {
  return (
    <>
      <TextField
        label="Your name"
        value={parentName}
        onChange={(e) => onParentName(e.target.value)}
        placeholder="e.g. Dad"
        required
      />
      <TextField
        label="Family name"
        value={householdName}
        onChange={(e) => onHouseholdName(e.target.value)}
        placeholder="e.g. The Smith Family"
        required
      />
    </>
  );
}

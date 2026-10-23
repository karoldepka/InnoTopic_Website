export interface InfoItem {
  label: string;
  value: string;
}

/** Shown in the CV header and given to the CV chat (see scripts/generate-cv-context.mjs). */
export const personalDataItems: InfoItem[] = [
  { label: 'First Name', value: 'Karol' },
  { label: 'Last Name', value: 'Depka Pradzinski' },
  { label: 'Birth Date', value: '1984-12-07' },
  { label: 'Pronouns', value: 'he/him/himself/his' },
  { label: 'Nationality', value: 'Polish' },
  { label: 'Education', value: 'Computer Science University Engineering Degree - Computer Programming and Networks (maximum grade)' },
  { label: "Driver's license", value: 'B (Passenger cars)' },
];

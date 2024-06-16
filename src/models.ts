export interface StaffData {
  availability: boolean[];
  types: number[];
}

export interface HelloWorldData {
  team: string | null;
}

export interface FacultyDinnerData {
  menu: 'omnivore' | 'vegetarian';
  payment: 'cash' | 'camipro' | 'bankTransfer' | null;
  latePayment: boolean;
  allergies: string[];
  notes: string | null;
  plusOnes: number;
  plusOnesCheckedIn: number;
}

export interface ICBDData {
  payment: 'cash' | 'camipro' | null;
  talks: number[]; // Index in the talks' array
  interviews: { [idx: number]: boolean }; // Index in the interviews' array, mapping to whether the activity was completed
  evicted: boolean;
}

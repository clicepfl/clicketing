'use client';

export interface ICBDTimeslot {
  room: string;
  start_time: string;
  end_time: string;
  custom_name?: string;
  max_attendees?: number;
  full?: boolean;
}

export interface ICBDActivityInfo {
  id: number;
  name: string;
  type: string;
}

export interface ICBDInterviewStatus {
  activity: ICBDActivityInfo;
  timeslot?: ICBDTimeslot | null; // currently assigned timeslot
  availableTimeslots?: ICBDTimeslot[];
}

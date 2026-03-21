export const signupStatusOptions = [
  { value: 'pending', label: '新报名' },
  { value: 'contacting', label: '联系中' },
  { value: 'rejected', label: '不合适' },
  { value: 'approved', label: '已通过' },
] as const;

export type SignupStatus = (typeof signupStatusOptions)[number]['value'];

export type SignupFormData = {
  name: string;
  employeeId: string;
  teamRole: string;
  interestArea: string[];
  problem: string;
  experience: string;
  weeklyCommitment: string;
};

export type SignupRecord = SignupFormData & {
  id: string;
  status: SignupStatus;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type SignupUpdatePayload = {
  status?: SignupStatus;
  note?: string;
};

export const emptySignupForm: SignupFormData = {
  name: '',
  employeeId: '',
  teamRole: '',
  interestArea: [],
  problem: '',
  experience: '',
  weeklyCommitment: '',
};

export const requiredSignupFields: Array<keyof SignupFormData> = [
  'name',
  'employeeId',
  'teamRole',
  'interestArea',
  'weeklyCommitment',
];

export function isSignupStatus(value: unknown): value is SignupStatus {
  return signupStatusOptions.some((option) => option.value === value);
}

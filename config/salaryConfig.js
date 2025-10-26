// ✅ Frontend Salary & Penalty Config (Should match backend)
export const SALARY_CONFIG = {
  PAY_PER_CONVERSATION: 20,
  UNREPLIED_PENALTY: 500,
  LATE_RESPONSE_PENALTY: 2000,
  RESPONSE_TIME_THRESHOLD: 5,
  BONUS_RULES: [
    { max: 1, bonus: 10000 },
    { max: 3, bonus: 4000 },
    { max: 4, bonus: 2000 },
    { max: 5, bonus: 1000 },
  ],
};

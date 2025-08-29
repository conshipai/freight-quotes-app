export const getUserType = (user) => {
  if (!user) return 'guest';
  return user.role || 'customer';
};

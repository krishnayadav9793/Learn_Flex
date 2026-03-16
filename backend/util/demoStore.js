export const demoUsers = [];

export const getPublicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  rating: user.rating ?? 0,
  questions: user.questions ?? 0
});


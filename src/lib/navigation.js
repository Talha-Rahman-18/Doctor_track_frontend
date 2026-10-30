// Lets non-React code (the RTK Query base query) navigate without importing the router,
// which would create a circular dependency.
let navigator = null;

export const setNavigator = (fn) => {
  navigator = fn;
};

export const navigateTo = (path) => navigator?.(path);

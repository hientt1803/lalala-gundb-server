export const helmetOptions = (appDomain: string) => ({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", appDomain],
      scriptSrc: ["'self'", appDomain],
    },
  },
  referrerPolicy: { policy: "no-referrer" },
  xDnsPrefetchControl: { allow: false },
  noSniff: false,
});

export const limiterOptions = {
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
};
import next from "eslint-config-next/core-web-vitals";

const config = [
  { ignores: [".next/**", "out/**", "android/**", "ios/**", "next-env.d.ts"] },
  ...next,
];

export default config;

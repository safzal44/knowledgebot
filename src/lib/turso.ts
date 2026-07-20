import { createClient } from "@libsql/client/web";

const url = import.meta.env.VITE_TURSO_DATABASE_URL || "https://knowledgebot-safzal44.aws-ap-northeast-1.turso.io";
const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN;

export const turso = createClient({
  url: url.replace(/^libsql:\/\//, "https://"),
  authToken,
});

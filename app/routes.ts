import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/dashboard", "routes/dashboard.tsx"),
  route("/review/:id", "routes/review.tsx"),
  route("/upload", "routes/upload.tsx"),
] satisfies RouteConfig;

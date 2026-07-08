import { createRouter } from "@tanstack/react-router";
import { Route as rootRoute } from "@/routes/__root";
import { Route as indexRoute } from "@/routes/index";
import { Route as loginRoute } from "@/routes/login";
import { Route as registerRoute } from "@/routes/register";
import { Route as forgotPasswordRoute } from "@/routes/forgot-password";
import { Route as usersListRoute } from "@/routes/users/index";
import { Route as userEditRoute } from "@/routes/users/$id";
import { Route as rolesListRoute } from "@/routes/roles/index";
import { Route as roleCreateRoute } from "@/routes/roles/new";
import { Route as roleEditRoute } from "@/routes/roles/$id";
import { Route as collectionsListRoute } from "@/routes/collections/index";
import { Route as collectionEntriesRoute } from "@/routes/collections/$slug";
import { Route as createEntryRoute } from "@/routes/collections/new.$slug";
import { Route as editEntryRoute } from "@/routes/collections/$id_.$slug.edit";

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
  usersListRoute,
  userEditRoute,
  rolesListRoute,
  roleCreateRoute,
  roleEditRoute,
  collectionsListRoute,
  collectionEntriesRoute,
  createEntryRoute,
  editEntryRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

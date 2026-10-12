import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/layout/Layout";
import { Home } from "./pages/Home";

// A home vem no pacote principal; as outras páginas são baixadas sob demanda
// (code splitting por rota), o que deixa o primeiro carregamento bem menor.
export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "sobre", lazy: () => import("./pages/About").then((m) => ({ Component: m.About })) },
      { path: "projetos", lazy: () => import("./pages/Projects").then((m) => ({ Component: m.Projects })) },
      { path: "experiencias", lazy: () => import("./pages/Experience").then((m) => ({ Component: m.Experience })) },
      { path: "contato", lazy: () => import("./pages/Contact").then((m) => ({ Component: m.Contact })) },
      // Atalhos em inglês
      { path: "about", element: <Navigate to="/sobre" replace /> },
      { path: "projects", element: <Navigate to="/projetos" replace /> },
      { path: "experience", element: <Navigate to="/experiencias" replace /> },
      { path: "contact", element: <Navigate to="/contato" replace /> },
      { path: "*", lazy: () => import("./pages/NotFound").then((m) => ({ Component: m.NotFound })) },
    ],
  },
]);

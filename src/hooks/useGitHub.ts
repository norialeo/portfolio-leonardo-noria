import { useEffect, useState } from "react";
import { fetchGitHub, type GitHubSnapshot } from "../lib/api";

type State =
  | { status: "loading"; data: null; error: null }
  | { status: "ready"; data: GitHubSnapshot; error: null }
  | { status: "error"; data: null; error: Error };

/** Dados públicos do GitHub (perfil, repositórios, atividade) via /api/github. */
export function useGitHub(): State {
  const [state, setState] = useState<State>({ status: "loading", data: null, error: null });

  useEffect(() => {
    let alive = true;
    fetchGitHub()
      .then((data) => alive && setState({ status: "ready", data, error: null }))
      .catch((error: Error) => alive && setState({ status: "error", data: null, error }));
    return () => {
      alive = false;
    };
  }, []);

  return state;
}

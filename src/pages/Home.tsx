import { Channels } from "../components/home/Channels";
import { GitHubActivity } from "../components/home/GitHubActivity";
import { Hero } from "../components/home/Hero";
import { Metrics } from "../components/home/Metrics";
import { RunningNow } from "../components/home/RunningNow";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import styles from "./Home.module.css";

export function Home() {
  useDocumentTitle();
  return (
    <>
      <Hero />
      <div className={styles.sections}>
        <Metrics />
        <RunningNow />
        <Channels />
        <GitHubActivity />
      </div>
    </>
  );
}

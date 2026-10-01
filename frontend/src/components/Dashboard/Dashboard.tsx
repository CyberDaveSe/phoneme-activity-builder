"use client";

import { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";

type Metrics = {
  totalWords: number;
  totalActivities: number;
  activities: {
    wordle: number;
    wordSearch: number;
    wordleGenerations: number;
    wordSearchGenerations: number;
    mostUsedType: "WORDLE" | "WORD_SEARCH" | null;
  };
  generations: {
    successful: number;
    failed: number;
    total: number;
    successRate: number;
  };
  usage: {
    averageTimeOnPageMs: number;
    recordedPageViews: number;
  };
};

type Health = {
  status: string;
  database: string;
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [metricsResponse, healthResponse] = await Promise.all([
          fetch("/api/metrics"),
          fetch("/health"),
        ]);

        if (!metricsResponse.ok || !healthResponse.ok) {
          throw new Error("Dashboard data could not be loaded.");
        }

        const metricsData = await metricsResponse.json();
        const healthData = await healthResponse.json();

        setMetrics(metricsData);
        setHealth(healthData);
      } catch (loadError) {
        console.error(loadError);
        setError("Unable to load dashboard information.");
      }
    }

    void loadDashboard();
  }, []);

  if (error) {
    return (
      <section className={styles.dashboard}>
        <h1>System Dashboard</h1>
        <div className={styles.errorAlert}>{error}</div>
      </section>
    );
  }

  if (!metrics || !health) {
    return (
      <section className={styles.dashboard}>
        <h1>System Dashboard</h1>
        <p>Loading operational data...</p>
      </section>
    );
  }

  const averageSeconds = (
    metrics.usage.averageTimeOnPageMs / 1000
  ).toFixed(1);

  const mostUsed =
    metrics.activities.mostUsedType === "WORDLE"
      ? "Wordle"
      : metrics.activities.mostUsedType === "WORD_SEARCH"
        ? "Word Search"
        : "No usage recorded";

  const healthy =
    health.status === "ok" && health.database === "connected";

  return (
    <section className={styles.dashboard}>
      <div className={styles.heading}>
        <h1>System Dashboard</h1>
        <p>
          Operational statistics and usage information for the Phoneme
          Activity Builder.
        </p>
      </div>

      <section className={styles.statusSection}>
        <h2>System Status</h2>

        <div
          className={healthy ? styles.healthGood : styles.healthWarning}
          role="status"
        >
          <strong>{healthy ? "Healthy" : "Attention required"}</strong>
          <span>
            Database: {health.database}
          </span>
        </div>
      </section>

      <section aria-labelledby="content-heading">
        <h2 id="content-heading">Stored Content</h2>

        <div className={styles.cardGrid}>
          <article className={styles.metricCard}>
            <span className={styles.metricValue}>{metrics.totalWords}</span>
            <span className={styles.metricLabel}>Stored Words</span>
          </article>

          <article className={styles.metricCard}>
            <span className={styles.metricValue}>
              {metrics.totalActivities}
            </span>
            <span className={styles.metricLabel}>Saved Activities</span>
          </article>

          <article className={styles.metricCard}>
            <span className={styles.metricValue}>
              {metrics.activities.wordle}
            </span>
            <span className={styles.metricLabel}>Wordle Activities</span>
          </article>

          <article className={styles.metricCard}>
            <span className={styles.metricValue}>
              {metrics.activities.wordSearch}
            </span>
            <span className={styles.metricLabel}>
              Word Search Activities
            </span>
          </article>
        </div>
      </section>

      <section aria-labelledby="generation-heading">
        <h2 id="generation-heading">Generation Activity</h2>

        <div className={styles.cardGrid}>
          <article className={styles.metricCard}>
            <span className={styles.metricValue}>
              {metrics.generations.successful}
            </span>
            <span className={styles.metricLabel}>
              Successful Generations
            </span>
          </article>

          <article className={styles.metricCard}>
            <span className={styles.metricValue}>
              {metrics.generations.failed}
            </span>
            <span className={styles.metricLabel}>
              Failed Generations
            </span>
          </article>

          <article className={styles.metricCard}>
            <span className={styles.metricValue}>
              {metrics.generations.successRate}%
            </span>
            <span className={styles.metricLabel}>
              Generation Success Rate
            </span>
          </article>

          <article className={styles.metricCard}>
            <span className={styles.metricValue}>{mostUsed}</span>
            <span className={styles.metricLabel}>
              Most-used Activity
            </span>
          </article>
        </div>
      </section>

      <section aria-labelledby="usage-heading">
        <h2 id="usage-heading">Usage</h2>

        <div className={styles.cardGrid}>
          <article className={styles.metricCard}>
            <span className={styles.metricValue}>
              {averageSeconds}s
            </span>
            <span className={styles.metricLabel}>
              Average Time on Builder
            </span>
          </article>

          <article className={styles.metricCard}>
            <span className={styles.metricValue}>
              {metrics.usage.recordedPageViews}
            </span>
            <span className={styles.metricLabel}>
              Recorded Builder Visits
            </span>
          </article>

          <article className={styles.metricCard}>
            <span className={styles.metricValue}>
              {metrics.activities.wordleGenerations}
            </span>
            <span className={styles.metricLabel}>
              Wordle Generations
            </span>
          </article>

          <article className={styles.metricCard}>
            <span className={styles.metricValue}>
              {metrics.activities.wordSearchGenerations}
            </span>
            <span className={styles.metricLabel}>
              Word Search Generations
            </span>
          </article>
        </div>
      </section>

      <section aria-labelledby="alerts-heading">
        <h2 id="alerts-heading">Operational Alerts</h2>

        <div className={styles.alertList}>
          <div
            className={
              healthy ? styles.successAlert : styles.warningAlert
            }
          >
            {healthy
              ? "Database connection is healthy."
              : "Database connection requires attention."}
          </div>

          <div
            className={
              metrics.generations.failed === 0
                ? styles.successAlert
                : styles.warningAlert
            }
          >
            {metrics.generations.failed === 0
              ? "No failed activity generations recorded."
              : `${metrics.generations.failed} failed activity generation(s) recorded.`}
          </div>

          {metrics.totalWords === 0 && (
            <div className={styles.warningAlert}>
              No words are currently stored in the database.
            </div>
          )}
        </div>
      </section>
    </section>
  );
}
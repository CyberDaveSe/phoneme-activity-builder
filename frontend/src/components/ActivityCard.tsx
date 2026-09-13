import Link from "next/link";
import styles from "./ActivityCard.module.css";

type ActivityCardProps = {
  title: string;
  description: string;
  href: string;
  preview: React.ReactNode;
};

export default function ActivityCard({
  title,
  description,
  href,
  preview,
}: ActivityCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.preview} aria-hidden="true">
        {preview}
      </div>

      <h2 className={styles.title}>{title}</h2>

      <p className={styles.description}>{description}</p>

      <Link href={href} className={styles.button}>
        Create Activity
      </Link>
    </article>
  );
}
import styles from "./Footer.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <p> Phoneme Activity Builder</p>
                <p>Created by David Seelig • Student No. 22449870</p>
                <p>Assessment One • CSE3CWA</p>
            </div>
        </footer>
    )
}
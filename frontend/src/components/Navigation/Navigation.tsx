"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./Navigation.module.css";

export default function Navigation() {
    const [menuOpen, setMenuOpen] = useState(false);
    
    function toggleMenu() {
        setMenuOpen(!menuOpen);
    }

    function closeMenu() {
        setMenuOpen(false);
    }
    
    return (
        <header className={styles.header}>
           <div className={styles.container}>
              <Link href="/" className={styles.logo}>
                 Phoneme Activity Builder
              </Link>

              <nav className={styles.nav} aria-label="Main navigation">
                 <Link href="/" className={styles.navLink}>
                    Home
                 </Link>

                 <Link href="/words" className={styles.navLink}>
                    Words
                 </Link>

                 <Link href="/activities" className={styles.navLink}>
                    Activities
                 </Link>

                 <Link href="/wordle" className={styles.navLink}>
                    Wordle
                 </Link>

                 <Link
                 href={{
                    pathname: "/word-search",
                    query: {},
                 }}
                 className={styles.navLink}
                 >
                    Word Search
                 </Link>
              </nav>

              <button
                 type="button"
                 className={styles.menuButton}
                 onClick={toggleMenu}
                 aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                 aria-expanded={menuOpen}
                 aria-controls="navigation-menu"
              >
                 <span className={styles.menuIcon} aria-hidden="true">
                    ☰
                 </span>
              </button>
           </div>

           {menuOpen && (
              <nav
                 id="navigation-menu"
                 className={styles.mobileMenu}
                 aria-label="Additional navigation"
              >
                <Link href="/" className={styles.mobileLink} onClick={closeMenu}>
                    Home
                </Link>

                <Link href="/words" className={styles.mobileLink} onClick={closeMenu}>
                    Words
                </Link>

                <Link href="/activities" className={styles.mobileLink} onClick={closeMenu}>
                    Activities
                </Link>

                <Link href="/wordle" className={styles.mobileLink} onClick={closeMenu}>
                    Wordle
                </Link>

                <Link
                href={{
                   pathname: "/word-search",
                   query: {},
                }}
                className={styles.mobileLink}
                onClick={closeMenu}
                >
                   Word Search
                </Link>

                <Link href="/about" className={styles.mobileLink} onClick={closeMenu}>
                    About
                </Link>

                <Link href="/settings" className={styles.mobileLink} onClick={closeMenu}>
                    Settings
                </Link>
              </nav>
           )}
           </header>

    );
}
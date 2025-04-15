import React, { useState, useEffect } from "react";
import { Link as ScrollLink, Events, scrollSpy } from "react-scroll";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import logoDark from "../../assets/images/Logo-SKEMA-Blanc.png";
import logoLight from "../../assets/images/Logo-SKEMA-Noir.png";
import styles from "./Navbar.module.css";

const SESSION_KEY = 'session_id';
const SESSION_TIMESTAMP_KEY = 'session_timestamp';
// 1 semaine = 7 jours * 24h * 3600 sec * 1000 ms = 604800000 ms
const SESSION_DURATION_MS = 604800000;

const Navbar = () => {
  const [activeSection, setActiveSection] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);

  useEffect(() => {
    scrollSpy.update();

    const handleScroll = () => {
      const sections = ["features", "howItWorks", "technologies"];
      let foundSection = "";
      for (let i = 0; i < sections.length; i++) {
        const section = document.getElementById(sections[i]);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (
            rect.top <= window.innerHeight / 2 &&
            rect.bottom >= window.innerHeight / 2
          ) {
            foundSection = sections[i];
            break;
          }
        }
      }
      if (foundSection && foundSection !== activeSection) {
        console.log(`Scroll détecté: ${foundSection}`);
        setActiveSection(foundSection);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activeSection]);

  useEffect(() => {
    const handleSetActive = (to) => {
      console.log(`Section activée par clic: ${to}`);
      setActiveSection(to);
      if (isMobile) {
        setMobileMenuOpen(false);
      }
    };

    Events.scrollEvent.register("begin", (to) => handleSetActive(to));
    Events.scrollEvent.register("end", (to) => handleSetActive(to));

    return () => {
      Events.scrollEvent.remove("begin");
      Events.scrollEvent.remove("end");
    };
  }, [isMobile]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 800);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleStart = () => {
    const storedSessionId = localStorage.getItem(SESSION_KEY);
    const storedTimestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);
    const now = Date.now();

    if (
      storedSessionId &&
      storedTimestamp &&
      now - parseInt(storedTimestamp, 10) < SESSION_DURATION_MS
    ) {
      console.log("Session déjà existante :", storedSessionId);
    } else {
      const newSessionId = uuidv4();
      localStorage.setItem(SESSION_KEY, newSessionId);
      localStorage.setItem(SESSION_TIMESTAMP_KEY, now.toString());
      console.log("Nouvelle session générée :", newSessionId);
    }
  };

  const logo = logoLight;

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <img src={logo} alt="Logo" />
      </div>
      {isMobile ? (
        <>
          <button
            className={styles.mobileToggle}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            =
          </button>
          {mobileMenuOpen && (
            <div className={styles.mobileMenuOverlay}>
              <ul className={styles.linksList}>
                <li>
                  <ScrollLink
                    activeClass={styles.active}
                    to="features"
                    spy={true}
                    smooth={true}
                    offset={-140}
                    duration={400}
                    onSetActive={() => setActiveSection("features")}
                  >
                    Features
                  </ScrollLink>
                </li>
                <li>
                  <ScrollLink
                    activeClass={styles.active}
                    to="howItWorks"
                    spy={true}
                    smooth={true}
                    offset={0}
                    duration={400}
                    onSetActive={() => setActiveSection("howItWorks")}
                  >
                    How It Works
                  </ScrollLink>
                </li>
                <li>
                  <ScrollLink
                    activeClass={styles.active}
                    to="technologies"
                    spy={true}
                    smooth={true}
                    offset={0}
                    duration={400}
                    onSetActive={() => setActiveSection("technologies")}
                  >
                    Technologies
                  </ScrollLink>
                </li>
              </ul>
              <div className={styles.startButton}>
                <Link to="/Chatboot">
                  <button onClick={handleStart}>Let’s Start</button>
                </Link>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className={styles.navLinks}>
            <ul className={styles.linksList}>
              <li>
                <ScrollLink
                  activeClass={styles.active}
                  to="features"
                  spy={true}
                  smooth={true}
                  offset={-140}
                  duration={400}
                  onSetActive={() => setActiveSection("features")}
                >
                  Features
                </ScrollLink>
              </li>
              <li>
                <ScrollLink
                  activeClass={styles.active}
                  to="howItWorks"
                  spy={true}
                  smooth={true}
                  offset={0}
                  duration={400}
                  onSetActive={() => setActiveSection("howItWorks")}
                >
                  How It Works
                </ScrollLink>
              </li>
              <li>
                <ScrollLink
                  activeClass={styles.active}
                  to="technologies"
                  spy={true}
                  smooth={true}
                  offset={0}
                  duration={400}
                  onSetActive={() => setActiveSection("technologies")}
                >
                  Technologies
                </ScrollLink>
              </li>
            </ul>
          </div>
          <div className={styles.startButton}>
            <Link to="/127">
              <button onClick={handleStart}>Let’s Start</button>
            </Link>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;

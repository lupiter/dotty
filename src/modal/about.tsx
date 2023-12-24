import styles from "./about.module.css";
import modalContentsStyles from "./modal-contents.module.css";
import logo from "../assets/logo.png";
import buttonStyle from "../button/button.module.css";
import { ModalContentProps } from "./modal-content";

export function About(props: ModalContentProps) {
  return (
    <>
      <div className={styles.modalContent}>
        <div className={styles.details}>
          <div className={styles.description}>
            <p className={modalContentsStyles.text}>
              Inspired by{" "}
              <a href="https://en.wikipedia.org/wiki/MacPaint">MacPaint</a>,
              thank you Bill Atkinson.
            </p>
            <p className={modalContentsStyles.text}>
              Copyright 2023, Catherine Wise
            </p>
            <p className={modalContentsStyles.text}>
              Fonts:{" "}
              <a
                href="http://www.suppertime.co.uk/blogmywiki/2017/04/chicago/"
                target="_blank"
              >
                ChiKareGo2
              </a>{" "}
              and{" "}
              <a href="http://www.suppertime.co.uk/blogmywiki/2017/04/finderskeepers/">
                Finders Keepers
              </a>
            </p>
          </div>
          <img src={logo} className={styles.img} alt="Dotty" />
        </div>
        <div className={styles.buttons}>
          <button className={buttonStyle.btn} onClick={props.onClose}>
            OK
          </button>
        </div>
      </div>
    </>
  );
}

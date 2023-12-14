import { useEffect, useRef, useState } from "react";
import styles from "./document.module.css";
import { Point, Size } from "./geometry";

type DocumentProps = {
  active: boolean;
  size: Size;
  children: JSX.Element;
  scroll: Point;
};

export function Document(props: DocumentProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (wrapper) {
      wrapper.scrollLeft = wrapper.scrollLeft - props.scroll.x;
      wrapper.scrollTop = wrapper.scrollTop - props.scroll.y;
    }
  }, [props.scroll])


  return (
    <div className={styles.window}>
      <div className={`${styles.titlebar} ${props.active && styles.active}`}>
        <h1 className={styles.title}>
          <span>Dotty</span>—
          <span>
            {props.size.width}x{props.size.height}
          </span>
        </h1>
      </div>
      <div className={styles.wrapper} ref={wrapperRef}>
        <div
          className={styles.inner}
          style={{
            width: props.innerStyle.width,
            height: props.innerStyle.height,
          }}
        >
          {props.children}
        </div>
      </div>
    </div>
  );
}

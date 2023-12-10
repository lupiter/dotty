import { useId, useState } from "react";
import styles from "./menu-option.module.css";
import menuStyles from "../menu.module.css";
import { Menu } from "../menu";

type MenuOption = {
  label: string;
  value: string;
};

type RadioMenuOptionProps = {
  label: string;
  options: MenuOption[];
  onChange: (value: string) => void;
  value: string;
};

type RadioMenuState = {
  isOpen: boolean;
};

export function RadioMenuOption(props: RadioMenuOptionProps) {
  const [state, setState] = useState<RadioMenuState>({
    isOpen: false,
  });

  const name = useId();
  const onClick = () => {
    setState({ isOpen: !state.isOpen });
  };

  const onChange = (value: string) => {
    props.onChange(value);
    window.setTimeout(() => {
      setState({ isOpen: false });
    }, 200);
  }

  return (
      <Menu label={props.label} open={state.isOpen} onClick={onClick}>
        {props.options.map((option: MenuOption) => (
          <li role="menuitem" key={option.value} className={styles.menuItem}>
            <input
              name={name}
              id={option.value}
              type="radio"
              value={option.value}
              onChange={() => onChange(option.value)}
            />
            <label htmlFor={option.value} className={styles.menuButton}>{option.label}</label>
          </li>
        ))}
      </Menu> 
  );
}

import { useId, useState } from "react";
import modalContentsStyles from "./modal-contents.module.css";
import buttonStyle from "../button/button.module.css";
import { ModalContentProps } from "./modal-content";

type PaletteLimitState = {
  limit: PALETTE;
};

export enum PALETTE {
  CGA,
  WEB,
  GBC,
  FULL,
}

export const paletteLabel = (palette: PALETTE): string => {
  switch (palette) {
    case PALETTE.CGA:
      return "CGA"
    case PALETTE.GBC:
      return "GBC"
    case PALETTE.WEB:
      return "WEB"
    case PALETTE.FULL:
      return "Unlimited";
  }
}

type PaletteLimitOption = { label: string; value: PALETTE; id: string };

export function PaletteLimit(
  props: ModalContentProps & { onChange: (limit: PALETTE) => void, limit: PALETTE }
) {
  const [state, setState] = useState<PaletteLimitState>({
    limit: props.limit,
  });

  const LIMITS: PaletteLimitOption[] = [
    { label: "16 colours (CGA)", value: PALETTE.CGA, id: useId() },
    { label: "256 colours (Websafe)", value: PALETTE.WEB, id: useId() },
    { label: "Thousands (GBC)", value: PALETTE.GBC, id: useId() },
    { label: "No limit", value: PALETTE.FULL, id: useId() },
  ];

  const name = useId();

  const onChange = (option: PALETTE) => {
    setState({ ...state, limit: option });
  };

  const onSet = () => {
    props.onChange(state.limit);
  };

  return (
    <>
      <h1 className={modalContentsStyles.header}>Limited Colours</h1>
      <fieldset className={modalContentsStyles.groupedFieldset}>
        {LIMITS.map((option: PaletteLimitOption) => (
          <div key={option.value} className={modalContentsStyles.fieldset}>
            <input
              name={name}
              id={option.id}
              type="radio"
              value={option.value}
              onChange={() => onChange(option.value)}
              checked={option.value === state.limit}
            />
            <label htmlFor={option.id}>{option.label}</label>
          </div>
        ))}
      </fieldset>
      <p>Please note, this action cannot be undone.</p>

      <section className={modalContentsStyles.buttons}>
        <button className={buttonStyle.btn} onClick={props.onClose}>
          Cancel
        </button>
        <button
          className={buttonStyle.btn}
          onClick={onSet}
          disabled={state.limit === undefined}
        >
          Confirm
        </button>
      </section>
    </>
  );
}

import { useState } from "react";
import { BaseMenuOptionProps, MenuOption } from "./menu-option";
import { Modal } from "../../modal/modal";

type ModalMenuOptionProps = BaseMenuOptionProps & {
  Content: (props: { onClose: () => void }) => JSX.Element;
};

export function ModalMenuOption(props: ModalMenuOptionProps) {
  const [open, setOpen] = useState(false);
  const onClick = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  return (
    <>
      <MenuOption
        onClick={onClick}
        label={props.label}
        shortcut={props.shortcut}
        hasChildren={true}
      />
      <Modal open={open} onClose={onClose}>
        <props.Content onClose={onClose} />
      </Modal>
    </>
  );
}
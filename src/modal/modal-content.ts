import { JSX } from "react";

export type ModalContentProps = {
  onClose(): void;
}

export type ModalMaker = (modalProps: ModalContentProps) => JSX.Element;
import { About } from "../modal/about";
import { Menu } from "./menu";
import style from "./menubar.module.css";
import { MenuOption } from "./menuoption/menu-option";
import { MenuSeparator } from "./separator";
import logo from "../assets/logo.png";
import { useState } from "react";
import { CheckMenuOption } from "./menuoption/check-menu-option";
import { ModalContentProps } from "../modal/modal-content";
import { LinkMenuOption } from "./menuoption/link-menu-option";

enum MENU {
  APP,
  FILE,
  EDIT,
  PALETTE,
  VIEW,
}

type MenuBarProps = {
  data: string;
  title: string;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClear: () => void;
  onPaletteChange: (palette: string) => void;
  onPaletteLockChange: (value: boolean) => void;
  paletteLocked: boolean;
  onPaletteClear: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomFit: () => void;
  modalOpen: (
    ModalContent: (props: { onClose: () => void }) => JSX.Element
  ) => void;
  openModal: boolean;
  ExportModal: (props: ModalContentProps) => JSX.Element;
  ResizeModal: (props: ModalContentProps) => JSX.Element;
  NewModal: (props: ModalContentProps) => JSX.Element;
  OpenModal: (props: ModalContentProps) => JSX.Element;
  ImportPaletteModal: (props: ModalContentProps) => JSX.Element;
  PaletteLimitModal: (props: ModalContentProps) => JSX.Element;
};

type MenuBarState = {
  openMenu?: MENU;
};

export function MenuBar(props: MenuBarProps) {
  const [state, setState] = useState<MenuBarState>({});

  if (props.openModal && state.openMenu) {
    state.openMenu = undefined;
  }

  const onMenuClick = (menu: MENU) => {
    if (menu === state.openMenu) {
      setState({ ...state, openMenu: undefined });
    } else {
      setState({ ...state, openMenu: menu });
    }
  };

  return (
    <menu role="menubar" className={style.menuBar}>
      <Menu
        label="Dotty"
        icon={logo}
        open={state.openMenu === MENU.APP}
        onClick={() => onMenuClick(MENU.APP)}
      >
        <MenuOption
          label="About"
          shortcut="cmd ?"
          hasChildren={true}
          onClick={() => props.modalOpen(About)}
        />
      </Menu>
      <Menu
        label="File"
        open={state.openMenu === MENU.FILE}
        onClick={() => onMenuClick(MENU.FILE)}
      >
        <MenuOption
          label="Open"
          shortcut="cmd o"
          hasChildren={true}
          onClick={() => props.modalOpen(props.OpenModal)}
        />
        <MenuOption
          label="New"
          shortcut="cmd n"
          hasChildren={true}
          onClick={() => props.modalOpen(props.NewModal)}
        />
        <LinkMenuOption
          label="Download"
          shortcut="cmd-s"
          href={props.data}
          download={`${props.title}.png`}
        />
        <MenuOption
          label="Export"
          shortcut="cmd e"
          hasChildren={true}
          onClick={() => props.modalOpen(props.ExportModal)}
        />
      </Menu>
      <Menu
        label="Edit"
        open={state.openMenu === MENU.EDIT}
        onClick={() => onMenuClick(MENU.EDIT)}
      >
        <MenuOption
          label="Undo"
          shortcut="cmd z"
          onClick={props.undo}
          disabled={!props.canUndo}
        />
        <MenuOption
          label="Redo"
          shortcut="shift cmd z"
          onClick={props.redo}
          disabled={!props.canRedo}
        />
        <MenuSeparator />
        <MenuOption label="Clear All" onClick={props.onClear} />
        <MenuOption
          label="Resize"
          hasChildren={true}
          onClick={() => props.modalOpen(props.ResizeModal)}
        />
      </Menu>
      <Menu
        label="Palette"
        open={state.openMenu === MENU.PALETTE}
        onClick={() => onMenuClick(MENU.PALETTE)}
      >
        <MenuOption
          label="Limit Colours"
          hasChildren={true}
          onClick={() => props.modalOpen(props.PaletteLimitModal)}
        />
        <CheckMenuOption
          label="Lock"
          value={props.paletteLocked}
          onChange={props.onPaletteLockChange}
        />
        <MenuOption label="Clear" onClick={props.onPaletteClear} />
        <MenuOption
          label="Import"
          hasChildren={true}
          onClick={() => props.modalOpen(props.ImportPaletteModal)}
        />
      </Menu>
      <Menu
        label="View"
        open={state.openMenu === MENU.VIEW}
        onClick={() => onMenuClick(MENU.VIEW)}
      >
        <MenuOption label="Zoom in" shortcut="cmd =" onClick={props.zoomIn} />
        <MenuOption label="Zoom out" shortcut="cmd -" onClick={props.zoomOut} />
        <MenuOption
          label="Zoom to fit"
          shortcut="shift cmd ="
          onClick={props.zoomFit}
        />
      </Menu>
    </menu>
  );
}

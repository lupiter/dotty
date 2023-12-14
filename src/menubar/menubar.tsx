import { About } from "../modal/about";
import { Export } from "../modal/export";
import { New } from "../modal/new";
import { Open } from "../modal/open";
import { Resize } from "../modal/resize";
import { Menu } from "./menu";
import style from "./menubar.module.css";
import { MenuOption } from "./menuoption/menu-option";
import { MenuSeparator } from "./separator";
import logo from "../assets/logo.png";
import { useState } from "react";
import { ImportPalette } from "../modal/import-palette";
import { CheckMenuOption } from "./menuoption/check-menu-option";
import { RadioMenuOption } from "./menuoption/radio-menu-option";

enum MENU {
  APP,
  FILE,
  EDIT,
  PALETTE,
  VIEW,
}

type MenuBarProps = {
  onDownload: () => void;
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
};

type MenuBarState = {
  openMenu?: MENU;
  openModal: boolean;
};

export function MenuBar(props: MenuBarProps) {
  const [state, setState] = useState<MenuBarState>({ openModal: false });

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
          onClick={() => props.modalOpen(Open)}
        />
        <MenuOption
          label="New"
          shortcut="cmd n"
          onClick={() => props.modalOpen(New)}
        />
        <MenuOption
          label="Download"
          shortcut="cmd-s"
          onClick={props.onDownload}
        />
        <MenuOption
          label="Export"
          shortcut="cmd e"
          onClick={() => props.modalOpen(About)}
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
        <MenuOption label="Resize" onClick={() => props.modalOpen(Resize)} />
      </Menu>
      <Menu
        label="Palette"
        open={state.openMenu === MENU.PALETTE}
        onClick={() => onMenuClick(MENU.PALETTE)}
      >
        <RadioMenuOption
          label="Limit Colours"
          options={[
            { label: "16 colours (CGA)", value: "cga" },
            { label: "256 colours (Websafe)", value: "web" },
            { label: "Thousands (GBC)", value: "gbc" },
            { label: "No limit", value: "full" },
          ]}
          value="full"
          onChange={props.onPaletteChange}
        />
        <CheckMenuOption
          label="Lock"
          value={props.paletteLocked}
          onChange={props.onPaletteLockChange}
        />
        <MenuOption label="Clear" onClick={props.onPaletteClear} />
        <MenuOption
          label="Import"
          onClick={() => props.modalOpen(ImportPalette)}
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

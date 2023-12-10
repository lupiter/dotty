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
import { ModalMenuOption } from "./menuoption/modal-menu-option";
import { RadioMenuOption } from "./menuoption/radio-menu-option";

enum MENU {
  APP,
  FILE,
  EDIT,
  PALETTE,
  VIEW,
}

export function MenuBar(props: {
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
}) {
  const [openMenu, setOpenMenu] = useState<MENU | undefined>(undefined);

  const onMenuClick = (menu: MENU) => {
    if (menu === openMenu) {
      setOpenMenu(undefined);
    } else {
      setOpenMenu(menu);
    }
  };

  return (
    <menu role="menubar" className={style.menuBar}>
      <Menu
        label="Dotty"
        icon={logo}
        open={openMenu === MENU.APP}
        onClick={() => onMenuClick(MENU.APP)}
      >
        <ModalMenuOption label="About" shortcut="cmd ?" Content={About} />
      </Menu>
      <Menu
        label="File"
        open={openMenu === MENU.FILE}
        onClick={() => onMenuClick(MENU.FILE)}
      >
        <ModalMenuOption label="Open" shortcut="cmd o" Content={Open} />
        <ModalMenuOption label="New" shortcut="cmd n" Content={New} />
        <MenuOption
          label="Download"
          shortcut="cmd-s"
          onClick={props.onDownload}
        />
        <ModalMenuOption label="Export" shortcut="cmd e" Content={Export} />
      </Menu>
      <Menu
        label="Edit"
        open={openMenu === MENU.EDIT}
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
        <ModalMenuOption label="Resize" Content={Resize} />
      </Menu>
      <Menu
        label="Palette"
        open={openMenu === MENU.PALETTE}
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
        <ModalMenuOption label="Import" Content={ImportPalette} />
      </Menu>
      <Menu
        label="View"
        open={openMenu === MENU.VIEW}
        onClick={() => onMenuClick(MENU.VIEW)}
      >
        <MenuOption label="Zoom in" shortcut="cmd =" onClick={props.zoomIn} />
        <MenuOption label="Zoom out" shortcut="cmd -" onClick={props.zoomOut} />
        <MenuOption label="Zoom to fit" shortcut="shift cmd =" onClick={props.zoomFit} />
      </Menu>
    </menu>
  );
}

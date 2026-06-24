"""The React Dashboard Studio integration."""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components import panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN, PANEL_ICON, PANEL_TAG, PANEL_TITLE, PANEL_URL_PATH

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up React Dashboard Studio from a config entry."""
    await _async_register_panel(hass)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload the config entry."""
    return True


async def _async_register_panel(hass: HomeAssistant) -> None:
    """Register the sidebar panel (once per HA instance)."""
    if hass.data.get(DOMAIN, {}).get("panel_registered"):
        return

    panel_dir = Path(__file__).parent
    static_url = f"/{DOMAIN}"

    await hass.http.async_register_static_paths(
        [StaticPathConfig(static_url, str(panel_dir), cache_headers=False)]
    )

    await panel_custom.async_register_panel(
        hass,
        webcomponent_name=PANEL_TAG,
        frontend_url_path=PANEL_URL_PATH,
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        module_url=f"{static_url}/dashboard.js",
        require_admin=False,
    )

    hass.data.setdefault(DOMAIN, {})["panel_registered"] = True
    _LOGGER.debug("React Dashboard Studio panel registered at /%s", PANEL_URL_PATH)

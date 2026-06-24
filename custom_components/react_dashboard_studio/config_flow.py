"""Config flow for React Dashboard Studio."""

from __future__ import annotations

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult

from .const import DOMAIN, PANEL_TITLE


class ReactDashboardStudioConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for React Dashboard Studio."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict | None = None
    ) -> ConfigFlowResult:
        """Confirm setup — no credentials required."""
        if self._async_in_progress():
            return self.async_abort(reason="already_in_progress")

        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is not None:
            return self.async_create_entry(title=PANEL_TITLE, data={})

        return self.async_show_form(step_id="user")

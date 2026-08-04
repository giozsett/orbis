from backend.services.modelo_config_service import obter_modelos


def test_catalogo_versionado_contem_fallbacks_somente_gratuitos():
    for finalidade in ("chat", "horoscopo"):
        modelos = obter_modelos(finalidade)

        assert len(modelos) >= 2
        assert modelos[-1] == "openrouter/free"
        assert all(
            modelo.endswith(":free") or modelo == "openrouter/free"
            for modelo in modelos
        )

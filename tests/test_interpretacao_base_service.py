from backend.services.interpretacao_base_service import (
    TEXTO_CASA_PADRAO,
    TEXTO_PLANETA_PADRAO,
    TEXTO_SIGNO_PADRAO,
    enriquecer_dados_mapa,
    gerar_interpretacao_base,
)
from backend.services.mapa_natal_service import PLANETAS, SIGNOS


def test_catalogo_cobre_planetas_signos_e_casas_com_textos_breves():
    for planeta, _codigo in PLANETAS:
        for signo in SIGNOS:
            interpretacao = gerar_interpretacao_base(planeta, signo, 1)
            assert interpretacao["planeta"] != TEXTO_PLANETA_PADRAO
            assert TEXTO_SIGNO_PADRAO not in interpretacao["signo"]
            assert len(interpretacao["planeta"]) <= 130
            assert len(interpretacao["signo"]) <= 170

    for casa in range(1, 13):
        interpretacao = gerar_interpretacao_base("Sol", "Escorpião", casa)
        assert TEXTO_CASA_PADRAO not in interpretacao["casa"]
        assert len(interpretacao["casa"]) <= 150


def test_interpretacao_combina_planeta_signo_e_casa():
    interpretacao = gerar_interpretacao_base("Sol", "Escorpião", 4)

    assert interpretacao["planeta"].startswith("O Sol representa")
    assert interpretacao["signo"].startswith("Seu Sol está em Escorpião")
    assert interpretacao["casa"].startswith("Na Casa 4")


def test_enriquece_mapa_antigo_sem_modificar_dados_originais():
    dados = {
        "planetas": [
            {"nome": "Lua", "signo": "Touro", "casa": 2},
        ]
    }

    enriquecidos = enriquecer_dados_mapa(dados)

    assert "interpretacao_base" not in dados["planetas"][0]
    assert enriquecidos["planetas"][0]["interpretacao_base"]["signo"].startswith(
        "Sua Lua está em Touro"
    )

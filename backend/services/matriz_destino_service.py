"""Cálculo da Matriz do Destino a partir da data de nascimento.

Segue o método do octagrama: um quadrado reto (dia, mês, ano e resultado)
sobreposto a um quadrado diagonal (ancestralidade), com o centro na soma
dos quatro vértices retos. Todos os valores são arcanos de 1 a 22.
"""

from datetime import date

from backend.services.arcano_pessoal_service import ArcanoPessoalError, reduzir_arcano, somar_digitos


def _r(*valores: int) -> int:
    return reduzir_arcano(sum(valores))


# Ordem dos vértices no sentido horário a partir da esquerda, com a idade
# em que cada um começa a atuar na linha do tempo.
VERTICES = [("A", 0), ("F", 10), ("B", 20), ("G", 30), ("C", 40), ("H", 50), ("D", 60), ("I", 70)]

CHAKRAS = [
    ("sahasrara", "Sahasrara", "Coroa", "#c9a7ff"),
    ("ajna", "Ajna", "Terceiro olho", "#9c8cff"),
    ("vishuddha", "Vishuddha", "Garganta", "#87b8ff"),
    ("anahata", "Anahata", "Coração", "#87dfb0"),
    ("manipura", "Manipura", "Plexo solar", "#ffd16a"),
    ("svadhisthana", "Svadhisthana", "Sacral", "#ffad6a"),
    ("muladhara", "Muladhara", "Raiz", "#ff6a7d"),
]


def _pontos_entre(inicio: int, fim: int, idade: int) -> list[dict]:
    """Sete pontos intermediários entre dois vértices, por bissecções sucessivas."""
    meio = _r(inicio, fim)
    quarto = _r(inicio, meio)
    tres_quartos = _r(meio, fim)
    valores = [
        (1.25, _r(inicio, quarto)),
        (2.5, quarto),
        (3.75, _r(quarto, meio)),
        (5, meio),
        (6.25, _r(meio, tres_quartos)),
        (7.5, tres_quartos),
        (8.75, _r(tres_quartos, fim)),
    ]
    return [{"idade": idade + passo, "arcano": arcano, "vertice": False} for passo, arcano in valores]


def calcular_matriz_destino(data_nascimento: date) -> dict:
    if not isinstance(data_nascimento, date):
        raise ArcanoPessoalError("Informe uma data de nascimento válida.")

    p = {}
    p["A"] = reduzir_arcano(data_nascimento.day)
    p["B"] = reduzir_arcano(data_nascimento.month)
    p["C"] = reduzir_arcano(somar_digitos(data_nascimento.year))
    p["D"] = _r(p["A"], p["B"], p["C"])
    p["E"] = _r(p["A"], p["B"], p["C"], p["D"])
    p["F"] = _r(p["A"], p["B"])
    p["G"] = _r(p["B"], p["C"])
    p["H"] = _r(p["C"], p["D"])
    p["I"] = _r(p["D"], p["A"])

    # Pontos internos de cada raio: x2 fica perto do centro, x1 entre x e x2
    for vertice in "ABCDFGHI":
        p[f"{vertice}2"] = _r(p[vertice], p["E"])
        p[f"{vertice}1"] = _r(p[vertice], p[f"{vertice}2"])
    # Pontos do coração, entre x2 e o centro, nos raios de personalidade e talento
    p["A3"] = _r(p["A2"], p["E"])
    p["B3"] = _r(p["B2"], p["E"])

    # Canais de dinheiro e de amor se cruzam entre C2 e D2
    p["X"] = _r(p["C2"], p["D2"])
    p["dinheiro"] = _r(p["X"], p["C2"])
    p["amor"] = _r(p["X"], p["D2"])

    ceu = _r(p["B"], p["D"])
    terra = _r(p["A"], p["C"])
    pessoal = _r(ceu, terra)
    masculina = _r(p["F"], p["H"])
    feminina = _r(p["G"], p["I"])
    social = _r(masculina, feminina)
    espiritual = _r(pessoal, social)

    idades = []
    for indice, (vertice, idade) in enumerate(VERTICES):
        proximo = VERTICES[(indice + 1) % len(VERTICES)][0]
        idades.append({"idade": idade, "arcano": p[vertice], "vertice": vertice})
        idades.extend(_pontos_entre(p[vertice], p[proximo], idade))

    pares_chakras = [
        (p["A"], p["B"]),
        (p["A1"], p["B1"]),
        (p["A2"], p["B2"]),
        (p["A3"], p["B3"]),
        (p["E"], p["E"]),
        (p["C2"], p["D2"]),
        (p["C"], p["D"]),
    ]
    chakras = [
        {"id": id_, "nome": nome, "descricao": descricao, "cor": cor, "fisico": fisico, "energia": energia, "emocoes": _r(fisico, energia)}
        for (id_, nome, descricao, cor), (fisico, energia) in zip(CHAKRAS, pares_chakras)
    ]
    total_fisico = _r(*(c["fisico"] for c in chakras))
    total_energia = _r(*(c["energia"] for c in chakras))

    return {
        "pontos": p,
        "proposito": {
            "ceu": ceu,
            "terra": terra,
            "pessoal": pessoal,
            "masculina": masculina,
            "feminina": feminina,
            "social": social,
            "espiritual": espiritual,
        },
        "canais": {
            "dinheiro": {"entrada": p["C"], "ponto": p["C2"], "cruzamento": p["X"], "canal": p["dinheiro"]},
            "amor": {"entrada": p["D2"], "cruzamento": p["X"], "canal": p["amor"]},
            "cauda_carmica": [p["D"], p["D1"], p["D2"]],
        },
        "idades": idades,
        "chakras": chakras,
        "chakras_total": {"fisico": total_fisico, "energia": total_energia, "emocoes": _r(total_fisico, total_energia)},
    }

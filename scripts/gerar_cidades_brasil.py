#!/usr/bin/env python3
"""Gera o dataset local de municípios com fuso IANA calculado por coordenadas."""

import argparse
import csv
import json
from pathlib import Path

from timezonefinder import TimezoneFinder


UF_POR_CODIGO = {
    "11": ("RO", "Norte"), "12": ("AC", "Norte"),
    "13": ("AM", "Norte"), "14": ("RR", "Norte"),
    "15": ("PA", "Norte"), "16": ("AP", "Norte"),
    "17": ("TO", "Norte"), "21": ("MA", "Nordeste"),
    "22": ("PI", "Nordeste"), "23": ("CE", "Nordeste"),
    "24": ("RN", "Nordeste"), "25": ("PB", "Nordeste"),
    "26": ("PE", "Nordeste"), "27": ("AL", "Nordeste"),
    "28": ("SE", "Nordeste"), "29": ("BA", "Nordeste"),
    "31": ("MG", "Sudeste"), "32": ("ES", "Sudeste"),
    "33": ("RJ", "Sudeste"), "35": ("SP", "Sudeste"),
    "41": ("PR", "Sul"), "42": ("SC", "Sul"),
    "43": ("RS", "Sul"), "50": ("MS", "Centro-Oeste"),
    "51": ("MT", "Centro-Oeste"), "52": ("GO", "Centro-Oeste"),
    "53": ("DF", "Centro-Oeste"),
}


def gerar(entrada: Path, saida: Path) -> list[dict]:
    finder = TimezoneFinder(in_memory=True)
    cidades = []

    with entrada.open(encoding="utf-8", newline="") as arquivo:
        for linha in csv.DictReader(arquivo):
            latitude = float(linha["latitude"])
            longitude = float(linha["longitude"])
            codigo_uf = str(linha.get("codigo_uf") or linha["codigo_ibge"][:2])
            uf, regiao = UF_POR_CODIGO[codigo_uf]
            timezone_calculado = finder.timezone_at(lat=latitude, lng=longitude)
            if timezone_calculado is None:
                raise ValueError(f"Fuso não encontrado para {linha['nome']} ({uf})")

            # timezonefinder usa zonas equivalentes para o instante atual e pode
            # retornar, por exemplo, America/Caracas dentro do Brasil. O ID
            # brasileiro da fonte preserva as regras históricas do zoneinfo.
            timezone_id = linha.get("fuso_horario", "").strip() or timezone_calculado

            cidades.append({
                "ibge": str(linha["codigo_ibge"]),
                "municipio": linha["nome"].strip(),
                "uf": uf,
                "regiao": regiao,
                "latitude": latitude,
                "longitude": longitude,
                "timezone_id": timezone_id,
            })

    cidades.sort(key=lambda cidade: (cidade["municipio"], cidade["uf"]))
    saida.parent.mkdir(parents=True, exist_ok=True)
    saida.write_text(
        json.dumps(cidades, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return cidades


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("entrada", type=Path, help="CSV com código IBGE e coordenadas")
    parser.add_argument(
        "--saida",
        type=Path,
        default=Path("backend/data/cidades_brasil.json"),
    )
    args = parser.parse_args()
    cidades = gerar(args.entrada, args.saida)
    print(f"{len(cidades)} municípios gravados em {args.saida}")


if __name__ == "__main__":
    main()

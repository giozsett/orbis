"""Converte os arquivos oficiais do GeoNames em datasets enxutos para o ORBIS."""

import argparse
import csv
import json
import zipfile
from pathlib import Path


def ler_paises(caminho: Path) -> dict[str, dict]:
    paises = {}
    with caminho.open(encoding="utf-8") as arquivo:
        for linha in arquivo:
            if not linha.strip() or linha.startswith("#"):
                continue
            campos = linha.rstrip("\n").split("\t")
            if len(campos) < 9:
                continue
            paises[campos[0]] = {
                "codigo": campos[0],
                "codigo_3": campos[1],
                "nome": campos[4],
                "continente": campos[8],
            }
    return paises


def ler_subdivisoes(caminho: Path) -> dict[str, str]:
    subdivisoes = {}
    with caminho.open(encoding="utf-8") as arquivo:
        for campos in csv.reader(arquivo, delimiter="\t"):
            if len(campos) >= 2:
                subdivisoes[campos[0]] = campos[1]
    return subdivisoes


def ler_cidades(caminho_zip: Path, subdivisoes: dict[str, str]) -> list[dict]:
    cidades = []
    with zipfile.ZipFile(caminho_zip) as pacote:
        nome_txt = next(nome for nome in pacote.namelist() if nome.endswith(".txt"))
        with pacote.open(nome_txt) as arquivo_binario:
            for linha in arquivo_binario:
                campos = linha.decode("utf-8").rstrip("\n").split("\t")
                if len(campos) < 18 or campos[8] == "BR":
                    continue
                pais = campos[8]
                subdivisao = subdivisoes.get(f"{pais}.{campos[10]}", campos[10])
                cidades.append({
                    "id": campos[0],
                    "nome": campos[1],
                    "nome_ascii": campos[2],
                    "pais_codigo": pais,
                    "subdivisao": subdivisao,
                    "latitude": float(campos[4]),
                    "longitude": float(campos[5]),
                    "populacao": int(campos[14] or 0),
                    "timezone_id": campos[17],
                })
    cidades.sort(key=lambda item: (item["pais_codigo"], item["nome"].casefold(), -item["populacao"]))
    return cidades


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--cidades", type=Path, required=True)
    parser.add_argument("--paises", type=Path, required=True)
    parser.add_argument("--subdivisoes", type=Path, required=True)
    parser.add_argument("--saida", type=Path, required=True)
    args = parser.parse_args()

    paises = ler_paises(args.paises)
    subdivisoes = ler_subdivisoes(args.subdivisoes)
    cidades = ler_cidades(args.cidades, subdivisoes)
    args.saida.mkdir(parents=True, exist_ok=True)
    (args.saida / "paises.json").write_text(
        json.dumps(sorted(paises.values(), key=lambda item: item["nome"].casefold()), ensure_ascii=False),
        encoding="utf-8",
    )
    (args.saida / "cidades_mundo.json").write_text(
        json.dumps(cidades, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(f"Geradas {len(cidades)} cidades de {len(paises)} países.")


if __name__ == "__main__":
    main()

# Dados de localização

- `cidades_brasil.json`: municípios brasileiros com código IBGE.
- `cidades_mundo.json`: cidades internacionais derivadas do `cities5000` do GeoNames.
- `paises.json`: países derivados do `countryInfo.txt` do GeoNames.

Os dados internacionais são fornecidos pelo [GeoNames](https://www.geonames.org/)
sob a licença Creative Commons Attribution 4.0. O recorte `cities5000` contém
cidades com população acima de 5.000 habitantes e sedes administrativas. O Brasil
continua usando o dataset municipal completo já existente no projeto.

Para atualizar os arquivos, baixe `cities5000.zip`, `countryInfo.txt` e
`admin1CodesASCII.txt` do diretório oficial `download.geonames.org/export/dump/`
e execute `scripts/gerar_cidades_mundo.py`.

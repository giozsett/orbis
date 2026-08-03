# Dados de localização

`cidades_brasil.json` é gerado a partir do CSV público do projeto
`kelvins/municipios-brasileiros`, que combina códigos IBGE, sedes municipais e
coordenadas. O arquivo não é consultado remotamente em tempo de execução.

Geração:

```bash
python scripts/gerar_cidades_brasil.py /caminho/municipios.csv
```

O script calcula o fuso geográfico uma vez com `timezonefinder`. Como essa
biblioteca pode devolver uma zona estrangeira com regras atuais equivalentes,
o resultado é confrontado com o identificador IANA brasileiro presente na
fonte, que é mantido como valor canônico. Isso preserva regras históricas de fuso e
horário de verão quando o backend usa `zoneinfo` na data de nascimento.

Fonte do CSV:
<https://github.com/kelvins/municipios-brasileiros/blob/main/csv/municipios.csv>

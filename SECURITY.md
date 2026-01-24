# Política de Segurança

## Versões Suportadas

| Versão | Suportada          |
| ------ | ------------------ |
| 1.x.x  | :white_check_mark: |

## Reportando uma Vulnerabilidade

A segurança do **clauderc** é levada a sério. Agradecemos seus esforços em divulgar responsavelmente suas descobertas.

### Como Reportar

**NÃO reporte vulnerabilidades de segurança através de issues públicas do GitHub.**

Em vez disso, por favor reporte vulnerabilidades de segurança através de um dos seguintes métodos:

1. **GitHub Security Advisories** (Recomendado)
   - Vá para [Security Advisories](https://github.com/matheuskindrazki/clauderc/security/advisories/new)
   - Clique em "Report a vulnerability"
   - Preencha o formulário com os detalhes

2. **Email direto**
   - Envie para: [seu-email@exemplo.com]
   - Use o assunto: `[SECURITY] clauderc - Breve descrição`

### O que incluir no reporte

Para nos ajudar a entender e resolver o problema rapidamente, inclua:

- **Tipo de vulnerabilidade** (ex: injeção de código, XSS, path traversal)
- **Localização do código** afetado (arquivo, linha, branch)
- **Passos para reproduzir** o problema
- **Impacto potencial** da vulnerabilidade
- **Possível correção** (se você tiver uma sugestão)

### O que esperar

1. **Confirmação**: Você receberá uma confirmação de recebimento em até 48 horas
2. **Triagem**: Avaliaremos a vulnerabilidade em até 7 dias
3. **Atualizações**: Manteremos você informado sobre o progresso
4. **Resolução**: Trabalharemos para resolver vulnerabilidades críticas em até 30 dias
5. **Crédito**: Após a correção, reconheceremos sua contribuição (se desejar)

### Escopo

Este projeto é uma coleção de templates e configurações para Claude Code. Vulnerabilidades relevantes incluem:

- **Templates que possam executar código malicioso**
- **Configurações que exponham dados sensíveis**
- **Problemas que afetem a segurança dos projetos que usam clauderc**
- **Vulnerabilidades em scripts ou automações incluídas**

### Fora do Escopo

- Vulnerabilidades no Claude Code em si (reporte para Anthropic)
- Vulnerabilidades em dependências externas (reporte ao projeto relevante)
- Problemas de configuração do usuário

## Melhores Práticas

Ao usar **clauderc** em seus projetos:

1. **Revise os templates** antes de aplicar em produção
2. **Não commite** arquivos `.env` ou credenciais
3. **Use variáveis de ambiente** para dados sensíveis
4. **Mantenha atualizado** para receber correções de segurança

## Reconhecimentos

Agradecemos a todos que contribuíram para a segurança deste projeto:

<!-- Lista de contribuidores de segurança será adicionada aqui -->

---

Obrigado por ajudar a manter o **clauderc** seguro!

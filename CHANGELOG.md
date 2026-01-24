# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Adicionado
- Documentação para contribuidores (CONTRIBUTING.md)
- Templates de Issues (bug report, feature request, nova stack)
- Template de Pull Request
- Código de Conduta (CODE_OF_CONDUCT.md)
- Política de Segurança (SECURITY.md)

## [1.0.0] - 2024-01-XX

### Adicionado
- **Templates de projeto**
  - CLAUDE.md template otimizado
  - Templates de commands (/test, /lint, /verify, /pr)
  - Templates de skills reutilizáveis
  - Templates de agents especializados
  - Documentação de time

- **Agente project-setup-wizard**
  - Análise automática de stack
  - Geração de CLAUDE.md contextual
  - Configuração completa de .claude/
  - Documentação automática

- **Stacks suportadas**
  - Next.js / React
  - Node.js / Express
  - Python / FastAPI / Django
  - TypeScript genérico
  - Monorepos

- **Documentação**
  - README com instruções de uso
  - Guias de contribuição
  - Exemplos de configuração

### Segurança
- Templates seguem boas práticas de segurança
- Instruções para não expor credenciais
- Validação de inputs em commands

---

## Tipos de Mudanças

- **Adicionado** para novas funcionalidades
- **Modificado** para mudanças em funcionalidades existentes
- **Obsoleto** para funcionalidades que serão removidas em breve
- **Removido** para funcionalidades removidas
- **Corrigido** para correções de bugs
- **Segurança** para vulnerabilidades

[Unreleased]: https://github.com/matheuskindrazki/clauderc/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/matheuskindrazki/clauderc/releases/tag/v1.0.0

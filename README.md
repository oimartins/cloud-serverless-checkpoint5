# Checkpoint 5 - CI/CD para Cloud Functions

Este projeto implementa um pipeline de CI/CD utilizando GitHub Actions para automatizar o deploy das Cloud Functions e do Google Cloud Workflow.

## Tecnologias

- GitHub Actions
- Google Cloud Functions Gen2
- Google Cloud Workflows
- Google Cloud Pub/Sub

## Fluxo CI/CD

```text
Git Push
    |
    v
GitHub Actions
    |
    +--> Deploy validateOrder
    |
    +--> Deploy notifyOrder
    |
    +--> Deploy Workflow
    |
    v
Ambiente Atualizado

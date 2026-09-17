# Checkpoint 5 - CI/CD com GitHub Actions para Google Cloud Functions

Este documento descreve o processo completo para configurar um pipeline de CI/CD utilizando GitHub Actions para realizar o deploy automático das Cloud Functions e do Google Cloud Workflows.

---

# Objetivo

Automatizar o deploy da aplicação sempre que ocorrer um push na branch `main`, eliminando a necessidade de implantações manuais.

---

# Pré-requisitos

- Conta Google Cloud Platform (GCP)
- Conta GitHub
- Google Cloud SDK instalado
- Git instalado
- Node.js 18 ou superior

Verificar instalações:

```bash
gcloud --version
```

```bash
git --version
```

```bash
node --version
```

---

# 1. Fazer Login no Google Cloud

```bash
gcloud auth login
```

Verificar usuário autenticado:

```bash
gcloud auth list
```

---

# 2. Criar um Projeto no GCP

Criar projeto:

```bash
gcloud projects create cloud-serverless-checkpoint5
```

Listar projetos:

```bash
gcloud projects list
```

Definir projeto ativo:

```bash
gcloud config set project cloud-serverless-checkpoint5
```

Verificar projeto atual:

```bash
gcloud config get-value project
```

---

# 3. Configurar Faturamento

Listar contas de faturamento:

```bash
gcloud billing accounts list
```

Associar o projeto:

```bash
gcloud billing projects link cloud-serverless-checkpoint5 \
  --billing-account=SEU_BILLING_ACCOUNT_ID
```

Verificar:

```bash
gcloud billing projects describe cloud-serverless-checkpoint5
```

---

# 4. Habilitar APIs Necessárias

Cloud Functions:

```bash
gcloud services enable cloudfunctions.googleapis.com
```

Cloud Workflows:

```bash
gcloud services enable workflows.googleapis.com
```

Cloud Run:

```bash
gcloud services enable run.googleapis.com
```

Cloud Build:

```bash
gcloud services enable cloudbuild.googleapis.com
```

Artifact Registry:

```bash
gcloud services enable artifactregistry.googleapis.com
```

Pub/Sub:

```bash
gcloud services enable pubsub.googleapis.com
```

Eventarc:

```bash
gcloud services enable eventarc.googleapis.com
```

Verificar serviços habilitados:

```bash
gcloud services list --enabled
```

---

# 5. Criar Service Account para o Pipeline

Criar:

```bash
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions CI/CD"
```

Listar:

```bash
gcloud iam service-accounts list
```

Exemplo de retorno:

```text
github-actions@cloud-serverless-checkpoint5.iam.gserviceaccount.com
```

---

# 6. Conceder Permissões

Definir variável:

```bash
export PROJECT_ID=cloud-serverless-checkpoint5
```

---

## Cloud Functions Admin

```bash
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudfunctions.admin"
```

---

## Workflows Admin

```bash
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/workflows.admin"
```

---

## Pub/Sub Admin

```bash
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/pubsub.admin"
```

---

## Service Account User

```bash
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

---

# 7. Gerar Credencial para GitHub Actions

Criar chave:

```bash
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com
```

Arquivo criado:

```text
key.json
```

⚠️ Nunca faça commit deste arquivo.

---

# 8. Proteger a Credencial

Criar ou editar `.gitignore`:

```gitignore
key.json
credentials.json
.env
```

Verificar:

```bash
cat .gitignore
```

---

# 9. Visualizar a Chave Gerada

Linux/Mac:

```bash
cat key.json
```

Windows PowerShell:

```powershell
Get-Content key.json
```

Copie todo o conteúdo do JSON.

---

# 10. Criar Repositório no GitHub

Criar um novo repositório:

```text
cloud-serverless-checkpoint5
```

Inicializar repositório local:

```bash
git init
```

Adicionar arquivos:

```bash
git add .
```

Primeiro commit:

```bash
git commit -m "Initial commit"
```

Definir branch principal:

```bash
git branch -M main
```

Adicionar origem:

```bash
git remote add origin https://github.com/SEU_USUARIO/cloud-serverless-checkpoint5.git
```

Enviar:

```bash
git push -u origin main
```

---

# 11. Criar Secrets no GitHub

Acesse:

```text
GitHub
→ Repository
→ Settings
→ Secrets and variables
→ Actions
```

Clique em:

```text
New repository secret
```

---

# 12. Criar Secret GCP_PROJECT_ID

Nome:

```text
GCP_PROJECT_ID
```

Valor:

```text
cloud-serverless-checkpoint5
```

Salvar.

---

# 13. Criar Secret GCP_CREDENTIALS

Nome:

```text
GCP_CREDENTIALS
```

Valor:

Cole todo o conteúdo do arquivo:

```json
{
  "type": "service_account",
  ...
}
```

Salvar.

---

# 14. Verificar Secrets

Deve existir:

```text
GCP_PROJECT_ID

GCP_CREDENTIALS
```

---

# 15. Criar Estrutura do Pipeline

Criar diretórios:

```bash
mkdir -p .github/workflows
```

Criar arquivo:

```bash
touch .github/workflows/deploy.yml
```

Estrutura final:

```text
.github/
└── workflows/
    └── deploy.yml
```

---

# 16. Criar Pipeline GitHub Actions

Arquivo:

```text
.github/workflows/deploy.yml
```

Conteúdo:

```yaml
name: Deploy Cloud Functions

on:
  push:
    branches:
      - main

jobs:
  deploy:

    runs-on: ubuntu-latest

    permissions:
      contents: read
      id-token: write

    steps:

      - name: Checkout
        uses: actions/checkout@v4

      - name: Authenticate GCP
        uses: google-github-actions/auth@v2
        with:
          credentials_json: '${{ secrets.GCP_CREDENTIALS }}'

      - name: Setup Google Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Set Project
        run: |
          gcloud config set project ${{ secrets.GCP_PROJECT_ID }}

      - name: Deploy validateOrder
        run: |
          cd validateOrder

          gcloud functions deploy validateOrder \
            --gen2 \
            --runtime=nodejs20 \
            --region=us-central1 \
            --source=. \
            --entry-point=validateOrder \
            --trigger-http \
            --allow-unauthenticated

      - name: Deploy notifyOrder
        run: |
          cd notifyOrder

          gcloud functions deploy notifyOrder \
            --gen2 \
            --runtime=nodejs20 \
            --region=us-central1 \
            --source=. \
            --entry-point=notifyOrder \
            --trigger-http \
            --allow-unauthenticated

      - name: Deploy Workflow
        run: |
          gcloud workflows deploy order-workflow \
            --location=us-central1 \
            --source=workflow.yaml
```

---

# 17. Fazer Commit do Pipeline

```bash
git add .
```

```bash
git commit -m "Adicionando CI/CD"
```

```bash
git push origin main
```

---

# 18. Verificar Execução Automática

Acesse:

```text
GitHub
→ Repository
→ Actions
```

Selecione:

```text
Deploy Cloud Functions
```

Execução esperada:

```text
✅ Checkout

✅ Authenticate GCP

✅ Setup Google Cloud SDK

✅ Set Project

✅ Deploy validateOrder

✅ Deploy notifyOrder

✅ Deploy Workflow

✅ Workflow completed successfully
```

---

# 19. Testar Pipeline Novamente

Alterar qualquer arquivo.

Exemplo:

```javascript
console.log("Nova versão");
```

Executar:

```bash
git add .
```

```bash
git commit -m "Teste pipeline"
```

```bash
git push origin main
```

O pipeline será executado automaticamente.

---

# Evidência para Entrega

Capturar print da tela:

```text
GitHub
→ Actions
→ Deploy Cloud Functions
→ Execução Concluída
```

A imagem deve mostrar:

```text
✔ Deploy validateOrder

✔ Deploy notifyOrder

✔ Deploy Workflow

✔ Workflow completed successfully
```

---

# Segurança

Nunca enviar para o GitHub:

```text
key.json
credentials.json
.env
```

Utilizar sempre:

```text
GitHub Actions Secrets
```

Secrets utilizados:

```text
GCP_PROJECT_ID

GCP_CREDENTIALS
```

Todas as credenciais devem permanecer armazenadas apenas na área de Secrets do GitHub.

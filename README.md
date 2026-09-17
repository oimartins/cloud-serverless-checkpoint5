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

#10. Criar Secret GCP_PROJECT_ID

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

# 11. Criar Secret GCP_CREDENTIALS

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

# 12. Verificar Secrets

Deve existir:

```text
GCP_PROJECT_ID

GCP_CREDENTIALS
```

---

# 13. Verificar Execução Automática

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

# 14. Testar Pipeline Novamente

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

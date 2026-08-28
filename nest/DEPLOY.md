# Déploiement AWS (Lightsail + Terraform)

Coût estimé : **~5$/mois** (bundle Lightsail).

## 0. Prérequis

- Un compte AWS avec des credentials configurés localement (`aws configure` ou variables d'env) pour Terraform, avec les droits sur Lightsail/**Route53**.
- [Terraform](https://developer.hashicorp.com/terraform/install) installé.
- Un nom de domaine avec une hosted zone publique déjà existante dans Route53 sur ce compte AWS.

## 1. Générer une clé SSH dédiée

```bash
ssh-keygen -t ed25519 -f ~/.ssh/tennis_directory_lightsail -C "tennis-directory-deploy"
```

## 2. Provisionner l'infra avec Terraform

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars   # renseigner domain_name (doit matcher le Caddyfile) + ajuster le reste si besoin
terraform init
terraform apply
```

Terraform crée aussi l'enregistrement `A` dans la hosted zone Route53 existante — pas d'étape DNS manuelle.

Récupérer les outputs :

```bash
terraform output static_ip
terraform output dns_record
```

## 3. Vérifier la propagation DNS

```bash
dig +short votre-domaine.example
```

(Peut prendre quelques minutes le temps que le TTL de 300s expire côté résolveurs.)

## 4. Vérifier le `Caddyfile`

[Caddyfile](Caddyfile) doit déjà contenir votre vrai domaine — il doit être identique à `domain_name` dans `terraform.tfvars`.

## 5. Copier le code sur l'instance

```bash
rsync -avz \
  --exclude node_modules --exclude build --exclude .git \
  --exclude .env --exclude .env.test \
  -e "ssh -i ~/.ssh/tennis_directory_lightsail" \
  ./ ubuntu@<static_ip>:/home/ubuntu/tennis_directory/
```

Ce rsync manuel n'est nécessaire que pour ce tout premier déploiement. Une fois la CI/CD configurée (section 10), les déploiements suivants se font via le workflow GitHub Actions (déclenchement manuel, voir section 10).

## 6. Créer `.env.prod` sur l'instance

```bash
ssh -i ~/.ssh/tennis_directory_lightsail ubuntu@<static_ip>
cd tennis_directory
cp .env.prod.example .env.prod
chmod 600 .env.prod
nano .env.prod   # renseigner un vrai mot de passe DB
```

## 7. Démarrer la stack

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## 8. Lancer les migrations (première fois, et à chaque nouvelle migration)

```bash
docker compose -f docker-compose.prod.yml exec app yarn migrate:run
```

## 9. Vérifier

```bash
docker compose -f docker-compose.prod.yml exec app wget -qO- http://localhost:3000/health
curl -I http://votre-domaine.example        # doit rediriger vers https
curl https://votre-domaine.example/health   # {"status":"ok"}, certificat Let's Encrypt valide
docker compose -f docker-compose.prod.yml ps
```

## 10. CI/CD (GitHub Actions)

Une fois le premier déploiement manuel fait (sections 1 à 9), les déploiements suivants peuvent être automatisés via [.github/workflows/deploy.yml](.github/workflows/deploy.yml) : la CI rsync le code sur l'instance, reconstruit l'image, relance les migrations, et recharge Caddy (sans coupure, via `caddy reload` — utile si le `Caddyfile` a changé).

**Déclenchement manuel uniquement** (pas de trigger automatique sur `push`) : le workflow n'a que `workflow_dispatch`, pour que vous choisissiez précisément quand déployer. Depuis l'onglet **"Actions"** du repo GitHub → **"Deploy"** → **"Run workflow"** → choisir la branche → **"Run workflow"**.

La CI ne touche jamais à Terraform : l'infra (instance, IP, DNS) reste provisionnée manuellement, pour éviter qu'un déclenchement puisse accidentellement modifier/détruire des ressources AWS.

**Secrets à ajouter dans le repo GitHub** (Settings → Secrets and variables → Actions → New repository secret) :

- `LIGHTSAIL_SSH_KEY` — le contenu de la **clé privée** SSH (`cat ~/.ssh/tennis_directory_lightsail`), pas la `.pub`.
- `LIGHTSAIL_HOST` — l'IP statique (`terraform output static_ip`).

⚠️ Cas particuliers qui restent manuels même avec la CI :

- Nouvelles variables dans `.env.prod` (ex: nouvelle intégration) → à ajouter à la main sur l'instance, la CI ne touche jamais ce fichier.
- Changement d'infra (taille de l'instance, etc.) → toujours `terraform apply` en local.

## Suivi non bloquant

`src/helpers/errorHandler.ts` renvoie actuellement l'erreur brute (`reply.send(error)`) pour toute erreur non liée à la validation, ce qui peut exposer des détails internes/stack traces aux clients. À durcir avant ou peu après la mise en prod (logger côté serveur, renvoyer un message générique en prod).

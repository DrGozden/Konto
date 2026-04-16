# Konto

GraphQL aplikacija za upravljanje licnim i zajednickim finansijama.

Projekat se sastoji iz dva glavna dela:

- backend aplikacije napisane u Go jeziku
- frontend aplikacije napisane u React + TypeScript + Vite okruzenju

Kao baza podataka koristi se PostgreSQL.

## Tehnologije

- Go
- gqlgen
- GraphQL
- PostgreSQL
- GORM
- React
- TypeScript
- Vite

## Struktura projekta

```text
/
├── database/              # SQL schema i seed fajlovi
├── dataloader/            # DataLoader implementacija
├── graph/                 # GraphQL schema i resolveri
├── middleware/            # Auth, CORS, logging
├── models/                # GORM modeli
├── repositories/          # Pristup bazi
├── services/              # Poslovna logika
├── Frontend/              # React frontend
├── main.go                # Pokretanje backend servera
├── .env.example           # Primer environment promenljivih
└── setup-db.sh            # Pomocna skripta (nije neophodna za pokretanje)
```

## Preduslovi

Pre pokretanja projekta potrebno je da budu instalirani:

- Go
- Node.js i npm
- PostgreSQL
- DBeaver ili drugi alat za rad sa PostgreSQL bazom

## Pokretanje baze podataka

### 1. Kreiranje prazne baze

U DBeaver-u treba napraviti novu PostgreSQL bazu

### 2. Kreiranje strukture baze

U root folderu projekta pokrenuti: psql -U postgres -d konto -f database/seeds/seed.sql

## Environment promenljive

U root direktorijumu projekta treba napraviti `.env` fajl na osnovu `.env.example`.

Primer sadrzaja:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=konto
DB_PORT=5432
DB_SSLMODE=disable

JWT_SECRET=your-super-secret-jwt-key-change-in-production

PORT=8080
ENV=development
```

Backend automatski ucitava `.env` iz root direktorijuma projekta, tako da nije potrebno posebno export-ovati promenljive u terminalu.

## Pokretanje backend-a

Iz root direktorijuma projekta pokrenuti:

```bash
go mod tidy
go run .
```

Backend ce nakon toga biti dostupan na:

- `http://localhost:8080`
- GraphQL Playground: `http://localhost:8080/`
- GraphQL endpoint: `http://localhost:8080/query`

## Pokretanje frontend-a

U drugom terminalu pokrenuti:

```bash
cd Frontend
npm install
npm run dev
```

Frontend ce biti dostupan na:

- `http://localhost:5173`

## Kako aplikacija komunicira sa bazom

Frontend se ne povezuje direktno sa bazom podataka.

Tok rada je sledeci:

- frontend salje GraphQL zahteve backend-u
- backend obradjuje zahteve
- backend se povezuje na PostgreSQL bazu preko podataka iz `.env` fajla

Zbog toga backend mora biti pokrenut pre frontend-a.

## Podrazumevani nalozi

Nakon izvrsavanja SQL seed fajlova mogu se koristiti sledeci kredencijali:

- korisnici: seedovani korisnici iz `database/seeds/003_users.sql` sa lozinkom `password` - Najcesce koriscen marko.petrovic@email.com
 - admin: `admin@konto.app` / `password`


## Najkraci postupak pokretanja

1. U DBeaver-u kreirati bazu `konto`
2. Pokrenuti psql -U postgres -d konto -f database/seeds/seed.sql
3. Napraviti `.env` fajl na osnovu `.env.example`
4. U root direktorijumu pokrenuti `go run .`
5. U `Frontend` direktorijumu pokrenuti `npm install` i `npm run dev`


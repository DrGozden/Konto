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
```

## Preduslovi

Pre pokretanja projekta potrebno je da budu instalirani:

- Go
- Node.js i npm
- PostgreSQL
- DBeaver ili drugi alat za rad sa PostgreSQL bazom

Nakon izvrsavanja SQL seed fajlova mogu se koristiti sledeci kredencijali:

- korisnici: seedovani korisnici iz `database/seeds/003_users.sql` sa lozinkom `password` - Najcesce koriscen marko.petrovic@email.com
 - admin: `admin@konto.app` / `password`


## Najkraci postupak pokretanja

1. U DBeaver-u kreirati bazu `konto`
2. Pokrenuti psql -U postgres -d konto -f database/seeds/seed.sql
3. Napraviti `.env` fajl na osnovu `.env.example`
4. U root direktorijumu pokrenuti `go mod tidy .` i `go run .`
5. U `Frontend` direktorijumu pokrenuti `npm install` i `npm run dev`


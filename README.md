# Company Site (HRSM)

## Obsah
- [O Projektu](#o-projektu)
- [Funkcionality](#funkcionality)
- [Technologie](#technologie)
- [Instalace a Spuštění](#instalace-a-spuštění)
  - [Požadavky](#požadavky)
  - [Backend (Django)](#backend-django)
  - [Frontend (React)](#frontend-react)
- [Použití](#použití)
- [Struktura Projektu](#struktura-projektu)
- [Licence](#licence)

---
## O Projektu

Tento projekt je full-stack webová aplikace, která kombinuje robustní backend postavený na **Django REST Frameworku** s dynamickým a interaktivním frontendem v **React.js**. Jeho hlavním účelem je centralizovaný HR systém pro správu zaměstnanců, oddělení a výkonu.

Cílem je poskytnout moderní, škálovatelné a bezpečné řešení pro firmy či osobní použítí.

## Funkcionality

* **Autentizace a Autorizace:** Bezpečné přihlašování a řízení přístupu uživatelů.
* **Správa Uživatelů a Rolí:** 
* **Finanční Transakce:**
    * Přidávání, prohlížení, úprava a mazání transakcí.
    * Filtrace a vyhledávání transakcí.
    * Sumarizace příjmů, výdajů a čistého zůstatku.
    * Rozpad podle kategorií.
    * (Další specifické finanční funkce, např. měsíční přehledy, grafy, rozpočtování)
* **Správa Kategorií:** 
* **Správa Absencí**
* **Reporty Zaměstnanců**

## Technologie

Projekt je postaven na následujících klíčových technologiích:

**Backend:**
* **Python 3.x**
* **Django 5.x:** Webový framework
* **Django REST Framework:** Pro tvorbu RESTful API

**Frontend:**
* **React 18.x:** JavaScript knihovna pro uživatelské rozhraní
* **TypeScript:** Typovaný JavaScript
* **React Router DOM:** Pro routování v aplikaci
* **CSS** Pro styling a design

**Databáze:**
* **SQLite3:** Výchozí pro vývoj a testování (lze snadno změnit na PostgreSQL/MySQL pro produkci)

## Instalace a Spuštění

Pro spuštění projektu lokálně postupujte podle následujících kroků:

### Požadavky

Ujistěte se, že máte nainstalované:
* Python 3.8+
* Node.js (LTS verze)
* npm nebo Yarn
* Git


### Backend (Django)

1.  **Přejděte do složky `backend`:**
    ```bash
    cd backend
    ```
2.  **Nainstalujte závislosti pomocí Poetry:**
    Pokud nemáte Poetry nainstalované, nainstalujte ho podle oficiální dokumentace (např. `pip install poetry`).
    Poté spusťte v adresáři `backend`:
    ```bash
    poetry install
    ```
    *Poetry automaticky vytvoří virtuální prostředí a nainstaluje všechny závislosti definované v `pyproject.toml`.*

3.  **Aktivujte virtuální prostředí (volitelné, ale doporučené pro interaktivní práci):**
    Pro spouštění dalších příkazů v kontextu virtuálního prostředí Poetry můžete buď prefixovat každý příkaz `poetry run`, nebo aktivovat shell:
    ```bash
    poetry shell
    ```
    *Pokud použijete `poetry shell`, budete v aktivovaném prostředí a stačí pak jen `python manage.py ...`.*
    *Pokud nepoužijete `poetry shell`, budete muset před každý Python příkaz přidat `poetry run` (např. `poetry run python manage.py ...`).*

4.  **Nastavte proměnné prostředí:**
    Vytvořte soubor `.env` v kořenovém adresáři `backend` a přidejte potřebné proměnné. Příklad:
    ```
    SECRET_KEY='vas_super_tajny_klic_django'
    DEBUG=True
    # DATABASE_URL=sqlite:///db.sqlite3  # Pro jiné databáze (např. PostgreSQL)
    ```
    *Upozornění: Pro produkční nasazení nezapomeňte `DEBUG=False` a použijte silný `SECRET_KEY`.*

5.  **Proveďte migrace databáze:**
    ```bash
    poetry run python manage.py makemigrations
    poetry run python manage.py migrate
    ```
    *Nebo jen `python manage.py migrate`, pokud jste předtím spustili `poetry shell`.*

6.  **Vytvořte superuživatele (admina) pro přístup do Django Adminu:**
    ```bash
    poetry run python manage.py createsuperuser
    ```
    *Nebo jen `python manage.py createsuperuser`, pokud jste předtím spustili `poetry shell`.*
    Postupujte podle pokynů.

7.  **Spusťte Django vývojový server:**
    ```bash
    poetry run python manage.py runserver
    ```
    *Nebo jen `python manage.py runserver`, pokud jste předtím spustili `poetry shell`.*
    Backend API bude dostupné na `http://127.0.0.1:8000/`.

### Frontend (React)

1.  **Otevřete nový terminál a přejděte do složky `frontend`:**
    ```bash
    cd ../frontend
    ```
2.  **Nainstalujte závislosti Node.js:**
    ```bash
    npm install
    # nebo
    yarn install
    ```
3.  **Nastavte proměnné prostředí:**
    Vytvořte soubor `.env` v kořenovém adresáři `frontend` a přidejte proměnné prostředí pro API. Příklad:
    ```
    REACT_APP_API_BASE_URL=[http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)
    ```
4.  **Spusťte React vývojový server:**
    ```bash
    npm start
    # nebo
    yarn start
    ```
    Frontend aplikace se spustí na `http://localhost:3000/` (nebo jiném dostupném portu) a automaticky se otevře v prohlížeči.

## Použití
1.  **Přihlášení:** Použijte uživatelské jméno a heslo superuživatele, které jste vytvořili v kroku `createsuperuser`, nebo se zaregistrujte, pokud máte povolenou registraci uživatelů.
2.  **Prozkoumávání:** Prozkoumejte rozhraní dashboardu, přidávejte transakce, sledujte souhrny atd.
3.  **Django Admin:** Pro přístup k backend administraci (správa uživatelů, kategorií, transakcí přímo v databázi) navštivte `http://127.0.0.1:8000/admin/`.

## Licence
Tento projekt je licencován pod AGPL-3.0 License. Podrobnosti viz soubor `LICENSE`.

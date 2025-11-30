import json
import os

# Phase 1: Major European Languages
phase1_translations = {
    'it-IT': {  # Italian
        "welcome": {
            "variations": [
                "Ciao! 👋 Benvenuto su iLaunching. Iniziamo?",
                "Ehi! Pronto a iniziare qualcosa di straordinario?",
                "Benvenuto! Facciamo partire il tuo viaggio.",
                "Ciao! Sei nel posto giusto. Partiamo!"
            ]
        },
        "welcomeBack": {
            "variations": [
                "Bentornato! 😊",
                "Ehi, ti ricordo! Bentornato!",
                "Che bello rivederti!",
                "Eccoti di nuovo qui! Benvenuto!"
            ]
        },
        "acknowledge": {
            "variations": [
                "Grazie! Un attimo...",
                "Perfetto, controllo...",
                "Un secondo, verifico...",
                "Ricevuto! Controllo veloce..."
            ]
        },
        "checking": {
            "variations": [
                "Cerco <strong>{email}</strong>...",
                "Verifico <strong>{email}</strong>...",
                "Controllo <strong>{email}</strong> nel sistema...",
                "Un attimo, cerco <strong>{email}</strong>..."
            ]
        },
        "wrongFormat": {
            "variations": [
                "Hmm, questo non sembra un'email valida. Riprova?",
                "Ops! Formato email non valido. Controllalo di nuovo?",
                "Qualcosa non va con quell'email. Puoi verificare?",
                "Quel formato email sembra strano. Ricontrolla?"
            ]
        },
        "userNotRegistered": {
            "variations": [
                "Sembra che tu sia nuovo qui! È emozionante. Vuoi unirti?",
                "Non ti vedo ancora nel sistema. Pronto per iniziare?",
                "Faccia nuova! Vuoi creare un account?",
                "Non sei ancora registrato. Lo cambiamo?"
            ]
        },
        "askName": {
            "variations": [
                "Ottima scelta! Come ti chiami?",
                "Perfetto! Come dovrei chiamarti?",
                "Fantastico! Fammi sapere il tuo nome.",
                "Bene! Qual è il tuo nome?"
            ]
        },
        "loginPrompt": {
            "variations": [
                "Bentornato! Qual è la tua email?",
                "Bello rivederti! Inserisci la tua email.",
                "Facciamo il login. Qual è la tua email?",
                "Pronto per accedere? Condividi la tua email."
            ]
        },
        "passwordPrompt": {
            "variations": [
                "Ti vedo! Ora inserisci la tua password.",
                "Trovato! Qual è la tua password?",
                "Eccoti! Inserisci la password per continuare.",
                "Capito! Ora la tua password, per favore."
            ]
        },
        "passwordCreate": {
            "message": "Perfetto! Ora proteggiamo il tuo account. Crea una password (almeno 8 caratteri):"
        },
        "passwordTooShort": {
            "message": "La tua password deve essere di almeno 8 caratteri. Riprova?"
        },
        "nameRequired": {
            "message": "Ho bisogno del tuo nome per continuare. Come ti chiami?"
        },
        "errors": {
            "generic": "Ops! Qualcosa è andato storto. Riprova.",
            "emailCheck": "Verifica email fallita",
            "loginFailed": "Login fallito. Controlla le tue credenziali.",
            "signupFailed": "Registrazione fallita. Riprova."
        }
    },
    'nl-NL': {  # Dutch
        "welcome": {
            "variations": [
                "Hoi! 👋 Welkom bij iLaunching. Zullen we beginnen?",
                "Hey! Klaar om iets geweldigs te beginnen?",
                "Welkom! Laten we je reis starten.",
                "Hallo! Je bent op de juiste plek. Laten we gaan!"
            ]
        },
        "welcomeBack": {
            "variations": [
                "Welkom terug! 😊",
                "Hey, ik herinner je! Welkom terug!",
                "Leuk je weer te zien!",
                "Daar ben je weer! Welkom!"
            ]
        },
        "acknowledge": {
            "variations": [
                "Bedankt! Even kijken...",
                "Perfect, even checken...",
                "Een moment, ik controleer...",
                "Ontvangen! Snelle check..."
            ]
        },
        "checking": {
            "variations": [
                "Even <strong>{email}</strong> opzoeken...",
                "<strong>{email}</strong> controleren...",
                "<strong>{email}</strong> in het systeem nakijken...",
                "Moment, <strong>{email}</strong> zoeken..."
            ]
        },
        "wrongFormat": {
            "variations": [
                "Hmm, dit lijkt geen geldig e-mailadres. Opnieuw proberen?",
                "Oeps! Ongeldig e-mailformaat. Nogmaals controleren?",
                "Er klopt iets niet met dat e-mailadres. Kun je het checken?",
                "Dat e-mailformaat ziet er vreemd uit. Controleren?"
            ]
        },
        "userNotRegistered": {
            "variations": [
                "Het lijkt erop dat je nieuw bent hier! Dat is spannend. Wil je meedoen?",
                "Ik zie je nog niet in het systeem. Klaar om te beginnen?",
                "Nieuw gezicht! Wil je een account aanmaken?",
                "Je bent nog niet geregistreerd. Zullen we dat veranderen?"
            ]
        },
        "askName": {
            "variations": [
                "Geweldige keuze! Wat is je naam?",
                "Perfect! Hoe moet ik je noemen?",
                "Geweldig! Laat me je naam weten.",
                "Mooi! Wat is je naam?"
            ]
        },
        "loginPrompt": {
            "variations": [
                "Welkom terug! Wat is je e-mail?",
                "Fijn je weer te zien! Voer je e-mail in.",
                "Laten we inloggen. Wat is je e-mail?",
                "Klaar om in te loggen? Deel je e-mail."
            ]
        },
        "passwordPrompt": {
            "variations": [
                "Ik zie je! Voer nu je wachtwoord in.",
                "Gevonden! Wat is je wachtwoord?",
                "Daar ben je! Voer je wachtwoord in om door te gaan.",
                "Begrepen! Nu je wachtwoord, alsjeblieft."
            ]
        },
        "passwordCreate": {
            "message": "Perfect! Laten we je account beveiligen. Maak een wachtwoord aan (minimaal 8 tekens):"
        },
        "passwordTooShort": {
            "message": "Je wachtwoord moet minimaal 8 tekens lang zijn. Opnieuw proberen?"
        },
        "nameRequired": {
            "message": "Ik heb je naam nodig om door te gaan. Hoe heet je?"
        },
        "errors": {
            "generic": "Oeps! Er ging iets mis. Probeer het opnieuw.",
            "emailCheck": "E-mailcontrole mislukt",
            "loginFailed": "Inloggen mislukt. Controleer je gegevens.",
            "signupFailed": "Registratie mislukt. Probeer het opnieuw."
        }
    },
    'pl-PL': {  # Polish
        "welcome": {
            "variations": [
                "Cześć! 👋 Witaj w iLaunching. Zaczynamy?",
                "Hej! Gotowy, aby rozpocząć coś niesamowitego?",
                "Witaj! Rozpocznijmy Twoją przygodę.",
                "Cześć! Jesteś we właściwym miejscu. Zaczynajmy!"
            ]
        },
        "welcomeBack": {
            "variations": [
                "Witaj ponownie! 😊",
                "Hej, pamiętam Cię! Witaj z powrotem!",
                "Miło Cię znowu widzieć!",
                "Znowu tu jesteś! Witaj!"
            ]
        },
        "acknowledge": {
            "variations": [
                "Dziękuję! Chwileczkę...",
                "Świetnie, sprawdzam...",
                "Moment, sprawdzam...",
                "Otrzymano! Szybkie sprawdzenie..."
            ]
        },
        "checking": {
            "variations": [
                "Szukam <strong>{email}</strong>...",
                "Sprawdzam <strong>{email}</strong>...",
                "Sprawdzam <strong>{email}</strong> w systemie...",
                "Chwila, szukam <strong>{email}</strong>..."
            ]
        },
        "wrongFormat": {
            "variations": [
                "Hmm, to nie wygląda na prawidłowy email. Spróbuj ponownie?",
                "Ups! Nieprawidłowy format emaila. Sprawdź jeszcze raz?",
                "Coś jest nie tak z tym emailem. Możesz sprawdzić?",
                "Ten format emaila wygląda dziwnie. Sprawdzić ponownie?"
            ]
        },
        "userNotRegistered": {
            "variations": [
                "Wygląda na to, że jesteś tu nowy! To ekscytujące. Chcesz dołączyć?",
                "Nie widzę Cię jeszcze w systemie. Gotowy na start?",
                "Nowa twarz! Chcesz utworzyć konto?",
                "Nie jesteś jeszcze zarejestrowany. Zmienimy to?"
            ]
        },
        "askName": {
            "variations": [
                "Świetny wybór! Jak masz na imię?",
                "Idealnie! Jak mam do Ciebie mówić?",
                "Super! Powiedz mi jak się nazywasz.",
                "Dobrze! Jak masz na imię?"
            ]
        },
        "loginPrompt": {
            "variations": [
                "Witaj ponownie! Jaki jest Twój email?",
                "Miło Cię znowu widzieć! Wpisz swój email.",
                "Zalogujmy Cię. Jaki jest Twój email?",
                "Gotowy do logowania? Podaj swój email."
            ]
        },
        "passwordPrompt": {
            "variations": [
                "Widzę Cię! Teraz wpisz hasło.",
                "Znaleziono! Jakie jest Twoje hasło?",
                "Jesteś! Wpisz hasło, aby kontynuować.",
                "Rozumiem! Teraz Twoje hasło, proszę."
            ]
        },
        "passwordCreate": {
            "message": "Idealnie! Teraz zabezpieczmy Twoje konto. Utwórz hasło (co najmniej 8 znaków):"
        },
        "passwordTooShort": {
            "message": "Twoje hasło musi mieć co najmniej 8 znaków. Spróbować ponownie?"
        },
        "nameRequired": {
            "message": "Potrzebuję Twojego imienia, aby kontynuować. Jak się nazywasz?"
        },
        "errors": {
            "generic": "Ups! Coś poszło nie tak. Spróbuj ponownie.",
            "emailCheck": "Nie udało się sprawdzić emaila",
            "loginFailed": "Logowanie nie powiodło się. Sprawdź dane logowania.",
            "signupFailed": "Rejestracja nie powiodła się. Spróbuj ponownie."
        }
    },
    'sv-SE': {  # Swedish
        "welcome": {
            "variations": [
                "Hej! 👋 Välkommen till iLaunching. Ska vi börja?",
                "Hej! Redo att börja något fantastiskt?",
                "Välkommen! Låt oss starta din resa.",
                "Hej! Du är på rätt plats. Låt oss börja!"
            ]
        },
        "welcomeBack": {
            "variations": [
                "Välkommen tillbaka! 😊",
                "Hej, jag minns dig! Välkommen tillbaka!",
                "Kul att se dig igen!",
                "Där är du igen! Välkommen!"
            ]
        },
        "acknowledge": {
            "variations": [
                "Tack! Ett ögonblick...",
                "Perfekt, kollar...",
                "En sekund, kontrollerar...",
                "Mottaget! Snabb koll..."
            ]
        },
        "checking": {
            "variations": [
                "Letar efter <strong>{email}</strong>...",
                "Kontrollerar <strong>{email}</strong>...",
                "Kollar <strong>{email}</strong> i systemet...",
                "Ett ögonblick, letar efter <strong>{email}</strong>..."
            ]
        },
        "wrongFormat": {
            "variations": [
                "Hmm, det ser inte ut som en giltig e-postadress. Försök igen?",
                "Hoppsan! Ogiltigt e-postformat. Kontrollera igen?",
                "Något är fel med den e-postadressen. Kan du kolla?",
                "Det e-postformatet ser konstigt ut. Kontrollera igen?"
            ]
        },
        "userNotRegistered": {
            "variations": [
                "Det verkar som att du är ny här! Det är spännande. Vill du gå med?",
                "Jag ser dig inte i systemet ännu. Redo att börja?",
                "Nytt ansikte! Vill du skapa ett konto?",
                "Du är inte registrerad ännu. Ska vi ändra på det?"
            ]
        },
        "askName": {
            "variations": [
                "Bra val! Vad heter du?",
                "Perfekt! Vad ska jag kalla dig?",
                "Fantastiskt! Låt mig veta ditt namn.",
                "Bra! Vad heter du?"
            ]
        },
        "loginPrompt": {
            "variations": [
                "Välkommen tillbaka! Vad är din e-post?",
                "Kul att se dig igen! Ange din e-post.",
                "Låt oss logga in dig. Vad är din e-post?",
                "Redo att logga in? Dela din e-post."
            ]
        },
        "passwordPrompt": {
            "variations": [
                "Jag ser dig! Ange nu ditt lösenord.",
                "Hittade dig! Vad är ditt lösenord?",
                "Där är du! Ange ditt lösenord för att fortsätta.",
                "Förstått! Nu ditt lösenord, tack."
            ]
        },
        "passwordCreate": {
            "message": "Perfekt! Nu säkrar vi ditt konto. Skapa ett lösenord (minst 8 tecken):"
        },
        "passwordTooShort": {
            "message": "Ditt lösenord måste vara minst 8 tecken långt. Försök igen?"
        },
        "nameRequired": {
            "message": "Jag behöver ditt namn för att fortsätta. Vad heter du?"
        },
        "errors": {
            "generic": "Hoppsan! Något gick fel. Försök igen.",
            "emailCheck": "E-postkontroll misslyckades",
            "loginFailed": "Inloggning misslyckades. Kontrollera dina uppgifter.",
            "signupFailed": "Registrering misslyckades. Försök igen."
        }
    },
    'da-DK': {  # Danish
        "welcome": {
            "variations": [
                "Hej! 👋 Velkommen til iLaunching. Skal vi starte?",
                "Hej! Klar til at begynde noget fantastisk?",
                "Velkommen! Lad os starte din rejse.",
                "Hej! Du er det rette sted. Lad os komme i gang!"
            ]
        },
        "welcomeBack": {
            "variations": [
                "Velkommen tilbage! 😊",
                "Hej, jeg husker dig! Velkommen tilbage!",
                "Dejligt at se dig igen!",
                "Der er du igen! Velkommen!"
            ]
        },
        "acknowledge": {
            "variations": [
                "Tak! Et øjeblik...",
                "Perfekt, tjekker...",
                "Et sekund, kontrollerer...",
                "Modtaget! Hurtig check..."
            ]
        },
        "checking": {
            "variations": [
                "Leder efter <strong>{email}</strong>...",
                "Kontrollerer <strong>{email}</strong>...",
                "Tjekker <strong>{email}</strong> i systemet...",
                "Et øjeblik, leder efter <strong>{email}</strong>..."
            ]
        },
        "wrongFormat": {
            "variations": [
                "Hmm, det ligner ikke en gyldig e-mail. Prøv igen?",
                "Ups! Ugyldigt e-mailformat. Tjek det igen?",
                "Noget er galt med den e-mail. Kan du tjekke?",
                "Det e-mailformat ser mærkeligt ud. Tjek igen?"
            ]
        },
        "userNotRegistered": {
            "variations": [
                "Det ser ud til, at du er ny her! Det er spændende. Vil du være med?",
                "Jeg ser dig ikke i systemet endnu. Klar til at starte?",
                "Nyt ansigt! Vil du oprette en konto?",
                "Du er ikke registreret endnu. Skal vi ændre det?"
            ]
        },
        "askName": {
            "variations": [
                "Godt valg! Hvad hedder du?",
                "Perfekt! Hvad skal jeg kalde dig?",
                "Fantastisk! Lad mig vide dit navn.",
                "Godt! Hvad hedder du?"
            ]
        },
        "loginPrompt": {
            "variations": [
                "Velkommen tilbage! Hvad er din e-mail?",
                "Dejligt at se dig igen! Indtast din e-mail.",
                "Lad os logge dig ind. Hvad er din e-mail?",
                "Klar til at logge ind? Del din e-mail."
            ]
        },
        "passwordPrompt": {
            "variations": [
                "Jeg ser dig! Indtast nu din adgangskode.",
                "Fundet! Hvad er din adgangskode?",
                "Der er du! Indtast din adgangskode for at fortsætte.",
                "Forstået! Nu din adgangskode, tak."
            ]
        },
        "passwordCreate": {
            "message": "Perfekt! Nu sikrer vi din konto. Opret en adgangskode (mindst 8 tegn):"
        },
        "passwordTooShort": {
            "message": "Din adgangskode skal være mindst 8 tegn lang. Prøv igen?"
        },
        "nameRequired": {
            "message": "Jeg har brug for dit navn for at fortsætte. Hvad hedder du?"
        },
        "errors": {
            "generic": "Ups! Noget gik galt. Prøv igen.",
            "emailCheck": "E-mailtjek mislykkedes",
            "loginFailed": "Login mislykkedes. Tjek dine oplysninger.",
            "signupFailed": "Tilmelding mislykkedes. Prøv igen."
        }
    },
    'nb-NO': {  # Norwegian
        "welcome": {
            "variations": [
                "Hei! 👋 Velkommen til iLaunching. Skal vi begynne?",
                "Hei! Klar til å starte noe fantastisk?",
                "Velkommen! La oss starte reisen din.",
                "Hei! Du er på rett sted. La oss begynne!"
            ]
        },
        "welcomeBack": {
            "variations": [
                "Velkommen tilbake! 😊",
                "Hei, jeg husker deg! Velkommen tilbake!",
                "Hyggelig å se deg igjen!",
                "Der er du igjen! Velkommen!"
            ]
        },
        "acknowledge": {
            "variations": [
                "Takk! Et øyeblikk...",
                "Perfekt, sjekker...",
                "Ett sekund, kontrollerer...",
                "Mottatt! Rask sjekk..."
            ]
        },
        "checking": {
            "variations": [
                "Leter etter <strong>{email}</strong>...",
                "Kontrollerer <strong>{email}</strong>...",
                "Sjekker <strong>{email}</strong> i systemet...",
                "Et øyeblikk, leter etter <strong>{email}</strong>..."
            ]
        },
        "wrongFormat": {
            "variations": [
                "Hmm, det ser ikke ut som en gyldig e-post. Prøv igjen?",
                "Oops! Ugyldig e-postformat. Sjekk det igjen?",
                "Noe er galt med den e-posten. Kan du sjekke?",
                "Det e-postformatet ser rart ut. Sjekk igjen?"
            ]
        },
        "userNotRegistered": {
            "variations": [
                "Det ser ut som du er ny her! Det er spennende. Vil du bli med?",
                "Jeg ser deg ikke i systemet ennå. Klar til å starte?",
                "Nytt ansikt! Vil du opprette en konto?",
                "Du er ikke registrert ennå. Skal vi endre det?"
            ]
        },
        "askName": {
            "variations": [
                "Flott valg! Hva heter du?",
                "Perfekt! Hva skal jeg kalle deg?",
                "Fantastisk! La meg vite navnet ditt.",
                "Bra! Hva heter du?"
            ]
        },
        "loginPrompt": {
            "variations": [
                "Velkommen tilbake! Hva er e-posten din?",
                "Hyggelig å se deg igjen! Skriv inn e-posten din.",
                "La oss logge deg inn. Hva er e-posten din?",
                "Klar til å logge inn? Del e-posten din."
            ]
        },
        "passwordPrompt": {
            "variations": [
                "Jeg ser deg! Skriv nå inn passordet ditt.",
                "Funnet! Hva er passordet ditt?",
                "Der er du! Skriv inn passordet ditt for å fortsette.",
                "Forstått! Nå passordet ditt, takk."
            ]
        },
        "passwordCreate": {
            "message": "Perfekt! Nå sikrer vi kontoen din. Opprett et passord (minst 8 tegn):"
        },
        "passwordTooShort": {
            "message": "Passordet ditt må være minst 8 tegn langt. Prøv igjen?"
        },
        "nameRequired": {
            "message": "Jeg trenger navnet ditt for å fortsette. Hva heter du?"
        },
        "errors": {
            "generic": "Oops! Noe gikk galt. Prøv igjen.",
            "emailCheck": "E-postsjekk mislyktes",
            "loginFailed": "Innlogging mislyktes. Sjekk påloggingsinformasjonen din.",
            "signupFailed": "Registrering mislyktes. Prøv igjen."
        }
    },
    'fi-FI': {  # Finnish
        "welcome": {
            "variations": [
                "Hei! 👋 Tervetuloa iLaunchingiin. Aloitetaanko?",
                "Hei! Valmiina aloittamaan jotain mahtavaa?",
                "Tervetuloa! Aloitetaan matkasi.",
                "Hei! Olet oikeassa paikassa. Aloitetaan!"
            ]
        },
        "welcomeBack": {
            "variations": [
                "Tervetuloa takaisin! 😊",
                "Hei, muistan sinut! Tervetuloa takaisin!",
                "Kiva nähdä sinut taas!",
                "Siinäpä olet taas! Tervetuloa!"
            ]
        },
        "acknowledge": {
            "variations": [
                "Kiitos! Hetki...",
                "Täydellista, tarkistan...",
                "Sekunti, tarkistan...",
                "Vastaanotettu! Nopea tarkistus..."
            ]
        },
        "checking": {
            "variations": [
                "Etsin <strong>{email}</strong>...",
                "Tarkistan <strong>{email}</strong>...",
                "Tarkistan <strong>{email}</strong> järjestelmästä...",
                "Hetki, etsin <strong>{email}</strong>..."
            ]
        },
        "wrongFormat": {
            "variations": [
                "Hmm, tuo ei näytä kelvolliselta sähköpostilta. Yritä uudelleen?",
                "Hups! Virheellinen sähköpostimuoto. Tarkista uudelleen?",
                "Jotain on vialla tuossa sähköpostissa. Voitko tarkistaa?",
                "Tuo sähköpostimuoto näyttää oudolta. Tarkista uudelleen?"
            ]
        },
        "userNotRegistered": {
            "variations": [
                "Näytät olevan uusi täällä! Se on jännittävää. Haluatko liittyä?",
                "En näe sinua vielä järjestelmässä. Valmiina aloittamaan?",
                "Uusi kasvo! Haluatko luoda tilin?",
                "Et ole vielä rekisteröitynyt. Muutetaanko se?"
            ]
        },
        "askName": {
            "variations": [
                "Hieno valinta! Mikä sinun nimesi on?",
                "Täydellinen! Miten kutsun sinua?",
                "Mahtavaa! Kerro nimesi.",
                "Hyvä! Mikä sinun nimesi on?"
            ]
        },
        "loginPrompt": {
            "variations": [
                "Tervetuloa takaisin! Mikä on sähköpostisi?",
                "Kiva nähdä sinut taas! Syötä sähköpostisi.",
                "Kirjataan sinut sisään. Mikä on sähköpostisi?",
                "Valmiina kirjautumaan? Jaa sähköpostisi."
            ]
        },
        "passwordPrompt": {
            "variations": [
                "Näen sinut! Syötä nyt salasanasi.",
                "Löytyi! Mikä on salasanasi?",
                "Siinä olet! Syötä salasanasi jatkaaksesi.",
                "Selvä! Nyt salasanasi, kiitos."
            ]
        },
        "passwordCreate": {
            "message": "Täydellinen! Nyt suojataan tilisi. Luo salasana (vähintään 8 merkkiä):"
        },
        "passwordTooShort": {
            "message": "Salasanasi on oltava vähintään 8 merkkiä pitkä. Yritä uudelleen?"
        },
        "nameRequired": {
            "message": "Tarvitsen nimesi jatkaakseni. Mikä sinun nimesi on?"
        },
        "errors": {
            "generic": "Hups! Jotain meni pieleen. Yritä uudelleen.",
            "emailCheck": "Sähköpostin tarkistus epäonnistui",
            "loginFailed": "Kirjautuminen epäonnistui. Tarkista kirjautumistietosi.",
            "signupFailed": "Rekisteröityminen epäonnistui. Yritä uudelleen."
        }
    }
}

locales_dir = 'public/locales'

for lang_code, translations in phase1_translations.items():
    lang_dir = os.path.join(locales_dir, lang_code)
    landing_path = os.path.join(lang_dir, 'landing.json')
    
    with open(landing_path, 'w', encoding='utf-8') as f:
        json.dump(translations, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Created {lang_code}/landing.json")

print(f"\n🎉 Phase 1 complete! Created landing.json for {len(phase1_translations)} languages")

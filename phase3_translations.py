import json
import os

# Phase 3: Eastern European Languages
phase3_translations = {
    'ru-RU': {  # Russian
        "welcome": {
            "variations": [
                "Привет! 👋 Добро пожаловать в iLaunching. Начнём?",
                "Привет! Готовы начать что-то потрясающее?",
                "Добро пожаловать! Давайте начнём ваш путь.",
                "Привет! Вы пришли в нужное место. Поехали!"
            ]
        },
        "welcomeBack": {
            "variations": [
                "С возвращением! 😊",
                "Эй, я помню вас! С возвращением!",
                "Рад видеть вас снова!",
                "Вы снова здесь! Добро пожаловать!"
            ]
        },
        "acknowledge": {
            "variations": [
                "Спасибо! Минуточку...",
                "Отлично, проверяю...",
                "Секунду, проверяю...",
                "Принято! Быстрая проверка..."
            ]
        },
        "checking": {
            "variations": [
                "Ищу <strong>{email}</strong>...",
                "Проверяю <strong>{email}</strong>...",
                "Проверяю <strong>{email}</strong> в системе...",
                "Минутку, ищу <strong>{email}</strong>..."
            ]
        },
        "wrongFormat": {
            "variations": [
                "Хм, это не похоже на действительный email. Попробуйте ещё раз?",
                "Упс! Неверный формат email. Проверьте ещё раз?",
                "Что-то не так с этим email. Можете проверить?",
                "Этот формат email выглядит странно. Проверить ещё раз?"
            ]
        },
        "userNotRegistered": {
            "variations": [
                "Похоже, вы здесь впервые! Это здорово. Хотите присоединиться?",
                "Я не вижу вас в системе. Готовы начать?",
                "Новое лицо! Хотите создать аккаунт?",
                "Вы ещё не зарегистрированы. Изменим это?"
            ]
        },
        "askName": {
            "variations": [
                "Отличный выбор! Как вас зовут?",
                "Идеально! Как мне вас называть?",
                "Замечательно! Скажите ваше имя.",
                "Хорошо! Как вас зовут?"
            ]
        },
        "loginPrompt": {
            "variations": [
                "С возвращением! Какой ваш email?",
                "Рад видеть вас снова! Введите email.",
                "Давайте войдём. Какой ваш email?",
                "Готовы войти? Поделитесь email."
            ]
        },
        "passwordPrompt": {
            "variations": [
                "Вижу вас! Теперь введите пароль.",
                "Нашёл! Какой ваш пароль?",
                "Вот вы где! Введите пароль для продолжения.",
                "Понял! Теперь ваш пароль, пожалуйста."
            ]
        },
        "passwordCreate": {
            "message": "Отлично! Теперь защитим ваш аккаунт. Создайте пароль (минимум 8 символов):"
        },
        "passwordTooShort": {
            "message": "Ваш пароль должен быть не менее 8 символов. Попробовать ещё раз?"
        },
        "nameRequired": {
            "message": "Мне нужно ваше имя, чтобы продолжить. Как вас зовут?"
        },
        "errors": {
            "generic": "Упс! Что-то пошло не так. Попробуйте ещё раз.",
            "emailCheck": "Не удалось проверить email",
            "loginFailed": "Вход не удался. Проверьте учётные данные.",
            "signupFailed": "Регистрация не удалась. Попробуйте ещё раз."
        }
    },
    'uk-UA': {  # Ukrainian
        "welcome": {
            "variations": [
                "Привіт! 👋 Ласкаво просимо до iLaunching. Почнемо?",
                "Привіт! Готові почати щось чудове?",
                "Ласкаво просимо! Почнемо вашу подорож.",
                "Привіт! Ви в правильному місці. Почнемо!"
            ]
        },
        "welcomeBack": {
            "variations": [
                "З поверненням! 😊",
                "Гей, я пам'ятаю вас! З поверненням!",
                "Радий бачити вас знову!",
                "Ви знову тут! Ласкаво просимо!"
            ]
        },
        "acknowledge": {
            "variations": [
                "Дякую! Хвилинку...",
                "Чудово, перевіряю...",
                "Секунду, перевіряю...",
                "Прийнято! Швидка перевірка..."
            ]
        },
        "checking": {
            "variations": [
                "Шукаю <strong>{email}</strong>...",
                "Перевіряю <strong>{email}</strong>...",
                "Перевіряю <strong>{email}</strong> в системі...",
                "Хвилинку, шукаю <strong>{email}</strong>..."
            ]
        },
        "wrongFormat": {
            "variations": [
                "Хм, це не схоже на дійсний email. Спробуйте ще раз?",
                "Ой! Невірний формат email. Перевірте ще раз?",
                "Щось не так з цим email. Можете перевірити?",
                "Цей формат email виглядає дивно. Перевірити ще раз?"
            ]
        },
        "userNotRegistered": {
            "variations": [
                "Схоже, ви тут вперше! Це чудово. Хочете приєднатися?",
                "Я не бачу вас у системі. Готові почати?",
                "Нове обличчя! Хочете створити обліковий запис?",
                "Ви ще не зареєстровані. Змінимо це?"
            ]
        },
        "askName": {
            "variations": [
                "Чудовий вибір! Як вас звати?",
                "Ідеально! Як мені вас називати?",
                "Прекрасно! Скажіть ваше ім'я.",
                "Добре! Як вас звати?"
            ]
        },
        "loginPrompt": {
            "variations": [
                "З поверненням! Який ваш email?",
                "Радий бачити вас знову! Введіть email.",
                "Давайте увійдемо. Який ваш email?",
                "Готові увійти? Поділіться email."
            ]
        },
        "passwordPrompt": {
            "variations": [
                "Бачу вас! Тепер введіть пароль.",
                "Знайшов! Який ваш пароль?",
                "Ось ви де! Введіть пароль для продовження.",
                "Зрозумів! Тепер ваш пароль, будь ласка."
            ]
        },
        "passwordCreate": {
            "message": "Чудово! Тепер захистимо ваш обліковий запис. Створіть пароль (мінімум 8 символів):"
        },
        "passwordTooShort": {
            "message": "Ваш пароль має бути не менше 8 символів. Спробувати ще раз?"
        },
        "nameRequired": {
            "message": "Мені потрібне ваше ім'я, щоб продовжити. Як вас звати?"
        },
        "errors": {
            "generic": "Ой! Щось пішло не так. Спробуйте ще раз.",
            "emailCheck": "Не вдалося перевірити email",
            "loginFailed": "Вхід не вдався. Перевірте облікові дані.",
            "signupFailed": "Реєстрація не вдалася. Спробуйте ще раз."
        }
    },
    'cs-CZ': {  # Czech
        "welcome": {
            "variations": [
                "Ahoj! 👋 Vítej v iLaunching. Začneme?",
                "Ahoj! Jsi připraven začít něco úžasného?",
                "Vítej! Začněme tvou cestu.",
                "Ahoj! Jsi na správném místě. Pojďme na to!"
            ]
        },
        "welcomeBack": {
            "variations": [
                "Vítej zpět! 😊",
                "Hej, pamatuju si tě! Vítej zpět!",
                "Rád tě zase vidím!",
                "Jsi tu zase! Vítej!"
            ]
        },
        "acknowledge": {
            "variations": [
                "Díky! Moment...",
                "Perfektní, kontroluji...",
                "Vteřinu, ověřuji...",
                "Přijato! Rychlá kontrola..."
            ]
        },
        "checking": {
            "variations": [
                "Hledám <strong>{email}</strong>...",
                "Kontroluji <strong>{email}</strong>...",
                "Kontroluji <strong>{email}</strong> v systému...",
                "Moment, hledám <strong>{email}</strong>..."
            ]
        },
        "wrongFormat": {
            "variations": [
                "Hmm, tohle nevypadá jako platný email. Zkusíš to znovu?",
                "Jejda! Neplatný formát emailu. Zkontroluj to ještě jednou?",
                "S tím emailem je něco špatně. Můžeš to zkontrolovat?",
                "Ten formát emailu vypadá divně. Zkontrolovat znovu?"
            ]
        },
        "userNotRegistered": {
            "variations": [
                "Vypadá to, že jsi tu nový! To je vzrušující. Chceš se připojit?",
                "V systému tě ještě nevidím. Jsi připraven začít?",
                "Nová tvář! Chceš vytvořit účet?",
                "Ještě nejsi zaregistrovaný. Změníme to?"
            ]
        },
        "askName": {
            "variations": [
                "Skvělá volba! Jak se jmenuješ?",
                "Perfektní! Jak tě mám oslovovat?",
                "Úžasné! Pověz mi své jméno.",
                "Dobře! Jak se jmenuješ?"
            ]
        },
        "loginPrompt": {
            "variations": [
                "Vítej zpět! Jaký je tvůj email?",
                "Rád tě zase vidím! Zadej svůj email.",
                "Přihlásíme tě. Jaký je tvůj email?",
                "Jsi připraven se přihlásit? Sdílej svůj email."
            ]
        },
        "passwordPrompt": {
            "variations": [
                "Vidím tě! Teď zadej své heslo.",
                "Našel jsem tě! Jaké je tvé heslo?",
                "Tam jsi! Zadej heslo pro pokračování.",
                "Rozumím! Teď tvoje heslo, prosím."
            ]
        },
        "passwordCreate": {
            "message": "Perfektní! Teď zabezpečíme tvůj účet. Vytvoř heslo (alespoň 8 znaků):"
        },
        "passwordTooShort": {
            "message": "Tvoje heslo musí mít alespoň 8 znaků. Zkusit znovu?"
        },
        "nameRequired": {
            "message": "Potřebuji tvoje jméno, abych mohl pokračovat. Jak se jmenuješ?"
        },
        "errors": {
            "generic": "Jejda! Něco se pokazilo. Zkus to prosím znovu.",
            "emailCheck": "Kontrola emailu selhala",
            "loginFailed": "Přihlášení selhalo. Zkontroluj přihlašovací údaje.",
            "signupFailed": "Registrace selhala. Zkus to prosím znovu."
        }
    },
    'bg-BG': {  # Bulgarian
        "welcome": {
            "variations": [
                "Здравей! 👋 Добре дошъл в iLaunching. Започваме ли?",
                "Хей! Готов ли си да започнеш нещо невероятно?",
                "Добре дошъл! Да започнем пътуването ти.",
                "Здравей! На правилното място си. Да започваме!"
            ]
        },
        "welcomeBack": {
            "variations": [
                "Добре дошъл отново! 😊",
                "Хей, помня те! Добре дошъл отново!",
                "Радвам се да те видя отново!",
                "Ето те отново! Добре дошъл!"
            ]
        },
        "acknowledge": {
            "variations": [
                "Благодаря! Момент...",
                "Перфектно, проверявам...",
                "Секунда, проверявам...",
                "Получено! Бърза проверка..."
            ]
        },
        "checking": {
            "variations": [
                "Търся <strong>{email}</strong>...",
                "Проверявам <strong>{email}</strong>...",
                "Проверявам <strong>{email}</strong> в системата...",
                "Момент, търся <strong>{email}</strong>..."
            ]
        },
        "wrongFormat": {
            "variations": [
                "Хмм, това не изглежда като валиден имейл. Опитай пак?",
                "Опа! Невалиден формат на имейл. Провери отново?",
                "Нещо не е наред с този имейл. Можеш ли да провериш?",
                "Този формат на имейл изглежда странно. Провери отново?"
            ]
        },
        "userNotRegistered": {
            "variations": [
                "Изглежда си нов тук! Вълнуващо е. Искаш ли да се присъединиш?",
                "Още не те виждам в системата. Готов ли си да започнеш?",
                "Ново лице! Искаш ли да създадеш профил?",
                "Още не си регистриран. Да променим това?"
            ]
        },
        "askName": {
            "variations": [
                "Страхотен избор! Как се казваш?",
                "Перфектно! Как да те наричам?",
                "Чудесно! Кажи ми името си.",
                "Добре! Как се казваш?"
            ]
        },
        "loginPrompt": {
            "variations": [
                "Добре дошъл отново! Какъв е имейлът ти?",
                "Радвам се да те видя отново! Въведи имейла си.",
                "Да те влезем. Какъв е имейлът ти?",
                "Готов ли си да влезеш? Сподели имейла си."
            ]
        },
        "passwordPrompt": {
            "variations": [
                "Виждам те! Сега въведи паролата си.",
                "Намерих те! Каква е паролата ти?",
                "Ето те! Въведи паролата си за да продължиш.",
                "Разбрах! Сега паролата ти, моля."
            ]
        },
        "passwordCreate": {
            "message": "Перфектно! Сега да защитим профила ти. Създай парола (поне 8 символа):"
        },
        "passwordTooShort": {
            "message": "Паролата ти трябва да е поне 8 символа. Опитай пак?"
        },
        "nameRequired": {
            "message": "Трябва ми името ти за да продължа. Как се казваш?"
        },
        "errors": {
            "generic": "Опа! Нещо се обърка. Моля опитай отново.",
            "emailCheck": "Проверката на имейла се провали",
            "loginFailed": "Влизането се провали. Провери данните си.",
            "signupFailed": "Регистрацията се провали. Моля опитай отново."
        }
    },
    'ro-RO': {  # Romanian
        "welcome": {
            "variations": [
                "Salut! 👋 Bine ai venit la iLaunching. Începem?",
                "Hei! Gata să începi ceva minunat?",
                "Bine ai venit! Să începem călătoria ta.",
                "Salut! Ești în locul potrivit. Să începem!"
            ]
        },
        "welcomeBack": {
            "variations": [
                "Bine ai revenit! 😊",
                "Hei, te-am recunoscut! Bine ai revenit!",
                "Mă bucur să te văd din nou!",
                "Ești din nou aici! Bine ai venit!"
            ]
        },
        "acknowledge": {
            "variations": [
                "Mulțumesc! Un moment...",
                "Perfect, verific...",
                "O secundă, verific...",
                "Primit! Verificare rapidă..."
            ]
        },
        "checking": {
            "variations": [
                "Caut <strong>{email}</strong>...",
                "Verific <strong>{email}</strong>...",
                "Verific <strong>{email}</strong> în sistem...",
                "Un moment, caut <strong>{email}</strong>..."
            ]
        },
        "wrongFormat": {
            "variations": [
                "Hmm, nu arată ca un email valid. Mai încerci o dată?",
                "Hopa! Format de email invalid. Verifici din nou?",
                "Ceva nu e în regulă cu acel email. Poți verifica?",
                "Formatul emailului arată ciudat. Verifici din nou?"
            ]
        },
        "userNotRegistered": {
            "variations": [
                "Se pare că ești nou aici! E captivant. Vrei să te alături?",
                "Nu te văd încă în sistem. Gata să începi?",
                "Față nouă! Vrei să creezi un cont?",
                "Nu ești încă înregistrat. Schimbăm asta?"
            ]
        },
        "askName": {
            "variations": [
                "Alegere grozavă! Cum te cheamă?",
                "Perfect! Cum să te numesc?",
                "Minunat! Spune-mi numele tău.",
                "Bine! Cum te cheamă?"
            ]
        },
        "loginPrompt": {
            "variations": [
                "Bine ai revenit! Care e emailul tău?",
                "Mă bucur să te văd din nou! Introdu emailul.",
                "Să te conectăm. Care e emailul tău?",
                "Gata să te conectezi? Împărtășește emailul."
            ]
        },
        "passwordPrompt": {
            "variations": [
                "Te văd! Acum introdu parola.",
                "Te-am găsit! Care e parola ta?",
                "Ești acolo! Introdu parola pentru a continua.",
                "Înțeles! Acum parola ta, te rog."
            ]
        },
        "passwordCreate": {
            "message": "Perfect! Acum să-ți securizăm contul. Creează o parolă (cel puțin 8 caractere):"
        },
        "passwordTooShort": {
            "message": "Parola ta trebuie să aibă cel puțin 8 caractere. Mai încerci?"
        },
        "nameRequired": {
            "message": "Am nevoie de numele tău pentru a continua. Cum te cheamă?"
        },
        "errors": {
            "generic": "Hopa! Ceva a mers prost. Te rog încearcă din nou.",
            "emailCheck": "Verificarea emailului a eșuat",
            "loginFailed": "Conectarea a eșuat. Verifică datele de autentificare.",
            "signupFailed": "Înregistrarea a eșuat. Te rog încearcă din nou."
        }
    },
    'hr-HR': {  # Croatian
        "welcome": {
            "variations": [
                "Bok! 👋 Dobrodošli u iLaunching. Počinjemo?",
                "Hej! Spremni započeti nešto nevjerojatno?",
                "Dobrodošli! Započnimo vaše putovanje.",
                "Bok! Na pravom ste mjestu. Krenimo!"
            ]
        },
        "welcomeBack": {
            "variations": [
                "Dobrodošli natrag! 😊",
                "Hej, sjećam se vas! Dobrodošli natrag!",
                "Drago mi je vidjeti vas ponovno!",
                "Opet ste tu! Dobrodošli!"
            ]
        },
        "acknowledge": {
            "variations": [
                "Hvala! Trenutak...",
                "Savršeno, provjeravam...",
                "Sekunda, provjeravam...",
                "Primljeno! Brza provjera..."
            ]
        },
        "checking": {
            "variations": [
                "Tražim <strong>{email}</strong>...",
                "Provjeravam <strong>{email}</strong>...",
                "Provjeravam <strong>{email}</strong> u sustavu...",
                "Trenutak, tražim <strong>{email}</strong>..."
            ]
        },
        "wrongFormat": {
            "variations": [
                "Hmm, ovo ne izgleda kao valjan email. Pokušati ponovno?",
                "Ups! Neispravan format emaila. Provjeriti ponovno?",
                "Nešto nije u redu s tim emailom. Možete li provjeriti?",
                "Format emaila izgleda čudno. Provjeriti ponovno?"
            ]
        },
        "userNotRegistered": {
            "variations": [
                "Čini se da ste novi ovdje! To je uzbudljivo. Želite li se pridružiti?",
                "Još vas ne vidim u sustavu. Spremni za početak?",
                "Novo lice! Želite li stvoriti račun?",
                "Još niste registrirani. Promijenimo to?"
            ]
        },
        "askName": {
            "variations": [
                "Odličan izbor! Kako se zovete?",
                "Savršeno! Kako da vas zovem?",
                "Divno! Recite mi svoje ime.",
                "Dobro! Kako se zovete?"
            ]
        },
        "loginPrompt": {
            "variations": [
                "Dobrodošli natrag! Koji je vaš email?",
                "Drago mi je vidjeti vas ponovno! Unesite svoj email.",
                "Prijavimo vas. Koji je vaš email?",
                "Spremni za prijavu? Podijelite svoj email."
            ]
        },
        "passwordPrompt": {
            "variations": [
                "Vidim vas! Sada unesite svoju lozinku.",
                "Pronašao sam vas! Koja je vaša lozinka?",
                "Tu ste! Unesite lozinku za nastavak.",
                "Shvaćam! Sada vašu lozinku, molim."
            ]
        },
        "passwordCreate": {
            "message": "Savršeno! Sada osigurajmo vaš račun. Stvorite lozinku (najmanje 8 znakova):"
        },
        "passwordTooShort": {
            "message": "Vaša lozinka mora imati najmanje 8 znakova. Pokušati ponovno?"
        },
        "nameRequired": {
            "message": "Trebam vaše ime za nastavak. Kako se zovete?"
        },
        "errors": {
            "generic": "Ups! Nešto je pošlo po zlu. Molim pokušajte ponovno.",
            "emailCheck": "Provjera emaila nije uspjela",
            "loginFailed": "Prijava nije uspjela. Provjerite svoje podatke.",
            "signupFailed": "Registracija nije uspjela. Molim pokušajte ponovno."
        }
    },
    'sr-RS': {  # Serbian
        "welcome": {
            "variations": [
                "Здраво! 👋 Добродошли у iLaunching. Почињемо?",
                "Хеј! Спремни да започнете нешто невероватно?",
                "Добродошли! Започнимо ваше путовање.",
                "Здраво! На правом сте месту. Крећемо!"
            ]
        },
        "welcomeBack": {
            "variations": [
                "Добродошли натраг! 😊",
                "Хеј, сећам се вас! Добродошли натраг!",
                "Драго ми је да вас поново видим!",
                "Опет сте ту! Добродошли!"
            ]
        },
        "acknowledge": {
            "variations": [
                "Хвала! Тренутак...",
                "Савршено, проверавам...",
                "Секунда, проверавам...",
                "Примљено! Брза провера..."
            ]
        },
        "checking": {
            "variations": [
                "Тражим <strong>{email}</strong>...",
                "Проверавам <strong>{email}</strong>...",
                "Проверавам <strong>{email}</strong> у систему...",
                "Тренутак, тражим <strong>{email}</strong>..."
            ]
        },
        "wrongFormat": {
            "variations": [
                "Хмм, ово не изгледа као исправан email. Покушати поново?",
                "Упс! Неисправан формат emailа. Проверити поново?",
                "Нешто није у реду са тим emailом. Можете ли проверити?",
                "Формат emailа изгледа чудно. Проверити поново?"
            ]
        },
        "userNotRegistered": {
            "variations": [
                "Изгледа да сте нови овде! То је узбудљиво. Желите ли да се придружите?",
                "Још вас не видим у систему. Спремни за почетак?",
                "Ново лице! Желите ли да креирате налог?",
                "Још нисте регистровани. Променимо то?"
            ]
        },
        "askName": {
            "variations": [
                "Одличан избор! Како се зовете?",
                "Савршено! Како да вас зовем?",
                "Дивно! Реците ми своје име.",
                "Добро! Како се зовете?"
            ]
        },
        "loginPrompt": {
            "variations": [
                "Добродошли натраг! Који је ваш email?",
                "Драго ми је да вас поново видим! Унесите свој email.",
                "Пријавимо вас. Који је ваш email?",
                "Спремни за пријаву? Поделите свој email."
            ]
        },
        "passwordPrompt": {
            "variations": [
                "Видим вас! Сада унесите своју лозинку.",
                "Пронашао сам вас! Која је ваша лозинка?",
                "Ту сте! Унесите лозинку за наставак.",
                "Схватам! Сада вашу лозинку, молим."
            ]
        },
        "passwordCreate": {
            "message": "Савршено! Сада обезбедимо ваш налог. Креирајте лозинку (најмање 8 знакова):"
        },
        "passwordTooShort": {
            "message": "Ваша лозинка мора имати најмање 8 знакова. Покушати поново?"
        },
        "nameRequired": {
            "message": "Требам ваше име за наставак. Како се зовете?"
        },
        "errors": {
            "generic": "Упс! Нешто је пошло по злу. Молим покушајте поново.",
            "emailCheck": "Провера emailа није успела",
            "loginFailed": "Пријава није успела. Проверите своје податке.",
            "signupFailed": "Регистрација није успела. Молим покушајте поново."
        }
    }
}

locales_dir = 'public/locales'

for lang_code, translations in phase3_translations.items():
    lang_dir = os.path.join(locales_dir, lang_code)
    landing_path = os.path.join(lang_dir, 'landing.json')
    
    with open(landing_path, 'w', encoding='utf-8') as f:
        json.dump(translations, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Created {lang_code}/landing.json")

print(f"\n🎉 Phase 3 complete! Created landing.json for {len(phase3_translations)} languages")

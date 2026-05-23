---
title: "Kodekamp: Kryptering med engangsnøkkel - resultater"
layout: post
link: http://blog.kjempekjekt.com/2015/08/14/kodekamp-kryptering-resultater/
date: 2015-08-14T12:11:55.205Z
tags:
  - Python
  - Kryptering
  - Konkurranse
---

Dette er en oppfølgingspost til [Kodekamp: Kryptering med engangsnøkkel](http://blog.kjempekjekt.com/2015/08/03/kodekamp-kryptering/). Her vil jeg gå nokså grundig gjennom hvordan oppgaven kan løses, og så ta et like detaljert blikk på hvert av bidragene som ble levert i løpet av uken. Til slutt forsøker jeg å kåre en vinner.

Tusen takk til alle dere som løste kodekampen og sendte inn bidrag! Hele 14 stykker deltok - det var over hva jeg våget å håpe på, og dette var skikkelig gøy.

Denne første kodekamp-oppsummeringen er veldig lang. Jeg kommer nok ikke til å gå så grundig til verks i fremtiden. Jeg håper at i alle fall dere som deltok orker å lese gjennom :)

Og forsøk da å tenke gjennom hvordan du tar kritikk, og hvordan man bør forholde seg til *code review*. Dere som får innspill til forbedringer: Vær glad for det! Innspill er muligheter til å lære noe. Og om du ikke er enig i mine vurderinger, så er det helt greit det også. Det er bare *mine* meninger.

## Steg for steg

Før vi går løs på bidragene som har kommet inn vil jeg gå gjennom stegene i én potensiell (min egen) løsning på oppgaven. Når jeg så ser på bidragene så vil jeg spesielt fremheve ulikhetene i forhold til denne løsningen. 

### UTF-8

For å gjøre det mulig å jobbe med UTF-8 er det greit å deklarere at kodefilen benytter UTF-8. Det gjør du ved å starte filen med den litt kryptiske linjen:

    # -*- coding: utf-8 -*-

Så kan jeg definere det gyldige alfabetet som en unicode-streng:

    alphabet = u"ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ ."

Jeg lager også en funksjon som bruker [codecs-modulen](http://pymotw.com/2/codecs/) i Python til å lese en UTF-8 tegnkodet fil, slik:

    import codecs

    def readMessage(path):
	    with codecs.open(path, "r", "utf-8") as file:
	        return file.read()

### Lese nøkkelfilen

Nøkkelfilen som skulle leses hadde et spesielt format, men det viste seg å være ganske enkelt å parse; den vanligste løsningen var rett og slett å erstatte bindestrek og linjeskift med *ingenting*.

I mitt Windows-vennlige program ble det sånn som dette:

    def readKey(path):
	    return readMessage(path)\
	           .replace("-", "")\
	           .replace("\r", "")\
	           .replace("\n", "")

### Operasjon == en høyereordens funksjon

Programmet dere skulle kode skulle kunne gjøre en av to operasjoner: *kryptering* og *dekryptering*. Mange av løsningene som kom inn valgte å løse dette ved å sende inn én av to ulike funksjoner til koden som utførte transformasjonen på teksten. Forskjellen på kryptering og dekryptering er jo bare bruk av enten *pluss* eller *minus*.

I min versjon av programmet ser det slik ut:

    from operator import add, sub

    def cryptoOperator(option):
	    return sub if option.startswith("d") else add

### og til slutt selve (de)krypteringen

Jeg lagde først en funksjon som tar inn en operasjon (representerer kryptering eller dekryptering), tekst som skal krypteres/dekrypteres, samt den hemmelige nøkkelen. Så bruker jeg funksjonen `zip` til å kombinere ett-og-ett tegn fra teksten med ett-og-ett tegn fra nøkkelen. Disse tegn-parene sender jeg så, ved hjelp av `map`, til en ny funksjon som krypterer eller dekryptere det ene tegnet:

    def shiftString(op, st, key):
        shifted = map(
            lambda (c, k): shiftChar(op, c, k), 
            zip(st, key))
        return "".join(shifted)

Hvis tegnet er i alfabetet vi bruker vil `shiftChar` utføre operasjonen `op` på indeksen til tegnet fra teksten og indeksen til tegnet fra nøkkelen. Deretter kan jeg hente ut tegnet jeg har kryptert/dekryptert til fra `alphabet`... 

    def shiftChar(op, c, cKey):
        if c in alphabet:
            n = op(alphabet.index(c), alphabet.index(cKey))
            return alphabet[toValidAlphabetIndex(n)]
        else:
            return c # keep char as is if not in alphabet

...det eneste jeg må passe på er at jeg bruker en gyldig indeks, og koden for det har jeg dratt ut i funksjonen `toValidAlphabetIndex`. Hvis indeksen har blitt negativ legger jeg til lengden av alfabetet, og ellers bruker jeg *modulo* alfabetlengden i tilfelle indeksen er blitt for stor: 

    def toValidAlphabetIndex(n):
        if n < 0:
            return (n + len(alphabet))
        else:
            return n % len(alphabet)

### ARGV og å sy alt sammen..

Til slutt kaller jeg funksjonene jeg har laget med argumentene til programmet. Oppgaven sa ingen ting om å validere input, så det dropper jeg.

    from sys import argv

    op = cryptoOperator(argv[1])
    message = readMessage(argv[2])
    key = readKey(argv[3])
    
    print shiftString(op, message, key)

Og det var det! Nå er det på tide å ta en titt på programmene dere lesere har bidratt med..

-- hver enkelt løsning (navn, lenke, vurdering av løsning)

## BIDRAGENE

Nå er det på tide å vurdere de ulike løsningene som har kommet inn...

### Arnt Joakim

[Kildekode](https://github.com/tormaroe/kodekamp-public/blob/kk1/1-One-Time-Pad/answers/arnt_joakim.py)

Arnt Joakims løsning ligner ganske mye på min egen, som jeg nettopp har gjennomgått - og det løser oppgaven akkurat som det skal. Et par ting kan jeg likevel trekke frem.

For det første: Jeg trodde jeg hadde vært veldig smart da jeg brukte `zip` sammen med `map` for å iterere over ett-og-ett tegn fra teksten og nøkkelen samtidig. Arnt Joakim kjenner Pythons map-funksjon bedre, og viser at bruk av `zip` er helt unødvendig:

    def process(msg, key, e):
        res = map(lambda m, k: processChar(m, k, e), msg, key)
        return "".join(res)

Arnt Joakim brukte derimot ikke en høyereordens funksjon til å skille kryptering og dekryptering, men i stedet en boolsk variabel. Og det er jo helt greit det.

    def calcChar(mi, ki, e):
        if (e):
            return (mi + ki) % len(alphabet)
        else:
            return (mi - ki) % len(alphabet)

Men denne løsningen viser også at jeg *ikke* behøver å justere spesielt for negative indekser, slik jeg gjorde i min `toValidAlphabetIndex`. I Python vil *modulo* også fikse negative verdier. Den er matematisk korrekt slik jeg tolker en rask titt i [wikipedia](https://en.wikipedia.org/wiki/Modulo_operation), i motsetning til modulo-operatoren i enkelte andre språk som for eksempel C# og Java. 

Til slutt viser Arnt Joakim også hvordan man idiomatisk kaller en main-funksjon kun hvis skriptet man befinner seg i er det skriptet som eksekveres:

    if __name__ == "__main__":
        main()

### Bjørn Einar

[Kildekode](https://github.com/tormaroe/kodekamp-public/blob/kk1/1-One-Time-Pad/answers/bjorn_einar.py)

Bjørn Einar klagde mye over problemer med tegnkoding, men kom til slutt opp med en interessant løsning. Han har det desidert største programmet, men det skyldes at han bruker [doctest](https://en.wikipedia.org/wiki/Doctest). Bjørn Einar sier:

> (Programmet skal) teste seg selv før den skriver ut kode, hvis dokumentarene feiler så kræsjer programmet. Artig

Jeg kommenterer ikke det noe mer, men du bør ta en titt på koden!

Jeg brukte funksjonene `add` og `sub`, mens Arnt Joakim brukte en bolsk variabel. Bjørn Einar har en litt annen vri: Han representerer kryptering med `1` og dekryptering med `-1`. Om for eksempel Arnt Joakim hadde gjort det samme, kunne han ha skrevet sin `calcChar` slik:

    def calcChar(mi, ki, e):
        return (mi + e * ki) % len(alphabet)

Der hvor Bjørn Einars løsning skiller seg mest ut er ved lesing av fil. Han har en funksjon som returnerer en iterator - filene leses ett-og-ett tegn av gangen:

    def iter_input(path,alfabet):
        with open(path, "r") as input:
            binary_chunks = iter(partial(input.read, 1), "")        
            for unicode_chunk in codecs.iterdecode(binary_chunks, "utf-8"):
                if not unicode_chunk in alfabet:
                    continue
                yield unicode_chunk

Dermed kan programmet lese og (de)kryptere gigantiske meldinger - om det skulle være av interesse.

Han velger å droppe alle tegn som ikke er i alfabetet, og dermed slipper han å gjøre noe spesielt for å parse nøkkelfilen også.

### Christian

[Kildekode](https://github.com/tormaroe/kodekamp-public/blob/kk1/1-One-Time-Pad/answers/christian.py)

Selv om mye er gjenkjennelig så skiller Christian (kollega fra Link Mobility) sin løsning seg endel fra de andre. Han gjør mange transformasjoner på få linjer, og det er stilig, men jeg synes han mister endel lesbarhet. Du kan jo ta en titt og vurdere selv..

Christian bruker `1` og `-1` for å representere krypteringsoperasjonen, slik som Bjørn Einar gjorde. Men måten han kommer frem til operasjonen på er litt anderledes. Her er et utdrag:

    # ...
    (encode,decode) = (1,-1)
    operations = {'e':encode,'d':decode}
    if (len(sys.argv) < 4 or sys.argv[1] not in operations): usage()
    (opcode,msgfile,keyfile) = sys.argv[1:4]
    # ...

Nå har han validert input, og henter ut operasjonsverdien med `operations[opcode]`.

For å parse nøkkelen har Christian valgt å bruke `filter`; han filtrerer bort alle tegn som ikke er en del av alfabetet (`chash` er en dictionary som mapper tegn til indeks):

    klist = filter(lambda x: x in chash, list(key))

Det virker som om Christian har hatt det gøy med denne oppgaven, og jeg liker hvordan han har tenkt. Han får pluss for eleganse, men minus for lesbarhet :)

### Einar Høst

Kildekode [versjon 1](https://github.com/tormaroe/kodekamp-public/blob/kk1/1-One-Time-Pad/answers/einar.py) og [versjon 2](https://github.com/tormaroe/kodekamp-public/blob/kk1/1-One-Time-Pad/answers/einar_v2.py)

Einar nøyde seg ikke med å levere bare ett bidrag, han måtte løse oppgaven to ganger. Forskjellen er ikke stor, men i versjon to bruker han `codecs.iterdecode` til å lese filene. Jeg er ikke helt sikker på hvilken forskjell det egentlig utgjør, men det kan han kanskje utdype i en kommentar?!

Einars løsning er kort og elegant. Han skiller kryptering og dekryptering i to ulike funksjoner, og velger én basert på første argument:

    def enc(x, p):
        return otp(lambda a, b: a + b, x, p)
    
    def dec(x, p):
        return otp(lambda a, b: a - b + len(alfa), x, p)
    
    otpop = dec if sys.argv[1] == 'd' else enc

Ved å plusse på alfabetlengden under dekryptering unngår han at den nye verdien blir negativ. Stilig det, selv om Arnt Joakim jo viste at dette ikke var nødvendig.

I stedet for å bruke `map` til å iterere over melding og nøkkel bruker Einar en *list comprehension*. Det virker som om dette (og generator expressions, som ikke er helt det samme, men som ligner) er nokså vanlig å bruke i Python.

    output = [ otpop(x, p) for (x,p) in zip(message, otpkey) ]

Det jeg likte aller mest med Einars løsning tror jeg likevel var hvordan han lagde en dictionary av alfabetet, og brukte denne til å hente ut indeksene (i stedet for å bruke `string.index()`):

    alfa = u'ABCDEFGHIJKLMNOPQRSTUVWXYZ\xc6\xd8\xc5 .'
    d = { ch : ix for (ix, ch) in enumerate(alfa) }

    def otp(f, x, p):
        return alfa[f(d[x], d[p]) % len(alfa)]

### Einar He.

[Kildekode](https://github.com/tormaroe/kodekamp-public/blob/kk1/1-One-Time-Pad/answers/einar_he.py)

Einar (en *ny* Einar altså) har levert en kort og kompakt løsning. Mangel på funksjonsdefinisjoner og noen korte / lite beskrivende variabelnavn går litt ut over lesbarheten, men kanskje ikke så mye at det gjør noe.

Einar filtrerer også nøkkelen på tegnene i alfabetet, men gjør det med et generator-uttrykk:

    key = (x for x in otp.read() if x in alf)

Og han bruker en list comprehension for å iterere over melding og nøkkel:

    [crypt[encr_type](x,y) if x in alf else x
     for x,y in zip(txt,key)]

`crypt` er en dictionary som inneholder funksjoner for henholdsvis kryptering og dekryptering:

    crypt = { 'd': (lambda x,y: alf[(alf.find(x) - alf.find(y)) % n]),
              'e': (lambda x,y: alf[(alf.find(x) + alf.find(y)) % n]) }

### Feng Xue

[Kildekode](https://github.com/tormaroe/kodekamp-public/blob/kk1/1-One-Time-Pad/answers/feng_xue.py)

Feng Xue har levert en løsning som følger noen navnekonvensjoner jeg ikke er helt enig i. Lesbarheten kunne vært bedre; spesielt har jeg problemer med å følge logikken i funksjonen `de_or_encrypt`:

    def de_or_encrypt(de_en_content, key, alpha, oper):
        content_num_list = map(partial(str_to_num, alp=alpha), de_en_content)
        matched_length_key = generate_matched_key(key, len(de_en_content))
        key_num_list = map(partial(str_to_num, alp=alpha), matched_length_key)
        encrypted_num_list = map(oper, content_num_list, key_num_list)
        mod_num_list = map(partial(mod, alp=alpha), encrypted_num_list)
        return "".join(map(partial(num_to_str, alp=alpha), mod_num_list))

Det er ikke alltid det hjelper å navngi alle operasjoner, og navngiving er uansett noe av det vanskeligste med programmering... Men programmet gjør hva det skal, ikke noe problem der.

En detalj som er fin er at Feng Xue splitter filene på linjeskift med `splitlines`. Dermed slipper han å fjerne `\r` og `\n` eller filtrere på gyldige tegn.

### Kitteh Evilson

[Kildekode](https://github.com/tormaroe/kodekamp-public/blob/kk1/1-One-Time-Pad/answers/kitteh.py)

Kitteh har også levert en kort og enkel løsning. Lite beskrivende variabelnavn som `a` og `b` og `x` og `y` gjør det litt vanskelig å følge koden. Og det var et problem fordi jeg først trodde at programmet gjorde en feil - output ble nesten riktig, men ikke helt. Hva er galt?

Etter litt testing skjønte jeg derimot at det bare var at tegnet `\r` ikke ble filtrert bort fra nøkkelen, og det var jo strengt tatt ikke et krav beskrevet i oppgaven. Så løsningen er godkjent.

Det mest overraskende / unike med løsningen er at Kitteh ikke kontrollerer om et tegn befinner seg i alfabetet, men baserer seg på at `rindex` (kunne vel like godt benyttet `index`?) kaster en exception:

    def f(a,b):
        try:
            x = alph.rindex(a)
            y = alph.rindex(b)
            return alph[(y-x if sys.argv[1] == "d" else x+y) % 31]
        except:
            return b

Om man ikke forventer at mange tegn er utenfor alfabetet så er dette en ok løsning, mens det ikke er optimalt å kaste en haug med unntak om input har mye av dette. Lengden på alfabetet burde heller ikke vært hardkodet til 31 fordi man da må huske å endre denne om man endrer på hva som er gyldige tegn.

Til Kittehs forsvar så sier hun (?) i eposten jeg fikk:

> Feilhåndtering, brukerinstruksjoner, kommentarer, etc. utelatt da det falt utenfor et av kravene til utføringen av oppgaven (å ha det gøy.)

Det liker jeg :)

### Kjetil

[Kildekode](https://github.com/tormaroe/kodekamp-public/blob/kk1/1-One-Time-Pad/answers/kjetil.py)

Kjetils løsning bruker getopt-modulen til å validere programmets argumenter. Det er jo fornuftig, men ingen andre gjorde det. Jeg er likevel litt overrasket over måten det er gjort på, og ville tro at getopt hadde mer funksjonalitet som gjorde det hele enklere. Noe å ta en nærmere titt på senere tenker jeg.

Ellers er Kjetils besvarelse stort sett en kombinasjon av ting vi allerede har vært innom - kanskje med unntak av at Kjetil foretrekker for-løkker fremfor map, generator expressions eller list comprehensions.

### Morten

[Kildekode](https://github.com/tormaroe/kodekamp-public/blob/kk1/1-One-Time-Pad/answers/morten.py)

Morten har levert en kort løsning som bruker min zip/map kombo for iterasjon. Den er grei, enkel å finne frem i, men tilfører ikke noe nytt. Forbedringer jeg ville foreslått var å fjerne litt kodeduplisering - både på tvers av encrypt/decrypt og der hvor disse kalles. Og så ville jeg unngått å hardkode `31`, lengden på alfabetet (også duplisert).

Morten gjør forresten et lite triks for å få til UTF-8 output:

    sys.stdout = codecs.getwriter('utf8')(sys.stdout)

Dette fungerer ikke så bra i min konsoll, men det er helt greit - oppgaven spesifiserte ikke noe om tegnkoding av output, og jeg stoler på at dette fungerte bra for Morten :) Det samme gjelder forøvrig output fra besvarelsene til Christian og Kjetil.

### Stian B.

[Kildekode](https://github.com/tormaroe/kodekamp-public/blob/kk1/1-One-Time-Pad/answers/stian_b.py)

Stian B. har ikke tatt høyde for `\r` i nøkkelfilen, men det er som sagt greit - og er enkelt å fikse. Måten han filtrerer bort uønskede tegn i nøkkelen på er han forresten alene om:

    text = codecs.open(filepath, 'r', encoding="utf-8").read()
    return ''.join(c for c in text if c not in "-\n")

Løsningen er enkel og grei, men inneholder en del duplisering og hardkodet alfabetlengde. Det mest positive å trekke frem er bruk av `assert`, som gjør noen av funksjonenes forventninger til input eksplisitte, for eksempel:

    def encrypt_char(char, key):
        assert key in weights
        if not char in weights: return char
        weight = weights[char] + weights[key]
        return alphabet[weight % 31]

### Stian E.

[Kildekode](https://github.com/tormaroe/kodekamp-public/blob/kk1/1-One-Time-Pad/answers/stian_e.py)

Husker dere vinneren av programmeringsbloggens julekalender for et par år siden? Stian Eikeland har levert et fint bidrag med god lesbarhet. Løsningen er generator-basert, og her er noen utdrag som viser det. Legg merke til `yield`, `iter`, `ifilter` og `izip`.

    from itertools import ifilter, izip
    
    def file_iter(filename):
        with codecs.open(filename, "r", "utf-8") as f:
            for char in iter(lambda: f.read(1), ""):
                yield char
    
    def key_cleaner(key):
        return ifilter(lambda char: char not in INVALID_KEY_CHARS, key)
    
    def process_message(operator, message, key):
        for [m, k] in izip(message, key):
            if m in VALUES:
                yield operator(m, k)
            else:
                yield m

Det eneste forbedringspotensialet jeg ser er duplisering på tvers av encrypter og decrypter-funksjonene.

### Teodor

[Kildekode](https://github.com/tormaroe/kodekamp-public/blob/kk1/1-One-Time-Pad/answers/teodor.py)

Teodor har gjort noe interessant som jeg ikke tror noen andre har tenkt på: Han representerer alfabetet som en toveis dictionary som både mapper fra tegn til indeks og fra indeks til tegn. Han bygger den slik:

    a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ .'.decode('utf8')
    d = dict()
    
    for i in range(0, len(a)):
        d[a[i]] = i
        d[i] = a[i]

Ganske fiffig. Når han så skal (de)kryptere et tegn gjør han slik som dette:

    # a er alfabet-dictionary
    # crypter er funksjon som gjør kryptering eller dekryptering
    a[crypter(a[letter], a[key_letter]) % (len(a) / 2)]

For å iterere over melding/nøkkel har Teodor brukt en uendelig while-løkke med en `break`. I tillegg fjerner han ugyldige nøkkel-tegn "on the fly". Jeg synes dette kommuniserer litt dårlig, men det er kanskje mest en vanesak?

    while 1:
        m = next_letter(message)
        k = next_valid_letter(key, alphabet)

        if not m or not k:
            break

        r = crypt_letter(crypter, m, k, alphabet)
        sys.stdout.write(r)

Det han derimot sørger for er å lese ett-og-ett tegn fra filene og skrive ett-og-ett tegn til output, så han kan håndtere "uendelig" store filer.

### Tormod

[Kildekode](https://github.com/tormaroe/kodekamp-public/blob/kk1/1-One-Time-Pad/answers/tormod.py)

Tormod viser oss en litt orginal måte å fjerne ugyldige tegn fra nøkkelen. Han bruker nemlig et regulært uttrykk:

    def fix_key(key):
        p = re.compile('[^'+ALPHABET+']')
        return p.sub('', key)

Litt *overkill* spør du meg, men det viser i alle fall at man har kontroll på noe som *er* et viktig utviklerverktøy.

Tormod bruker også asserts, og det er bra, men bruker ikke `with` når han åpner filen, og det er et forbedringspotensiale.

Tormod har også en unik vri på selve (de)krypterings-beregningen. I stedet for å velge om man skal addere eller subtrahere, eller eventuelt om man skal gange med `1` eller `-1`, så har Tormods løsning denne funskjonen:

    def get_pos_from_code_alphabet(index, key, mode):
        if mode == 'e':
            return ALPHABET.find(key[index])
        return -ALPHABET.find(key[index])

Funksjonsnavnet beskriver ikke helt hva funksjonen gjør. Hvis man krypterer så gir funksjonen indeksen til et tegn i alfabetet, men om man dekrypterer gir funksjonen den negerte indeksen:

    get_pos_from_code_alphabet(0, "GDW", "e")
    # ==> 6, indeksen til G i ABCDEFGH...

    get_pos_from_code_alphabet(0, "GDW", "d")
    # ==> -6, den negerte indeksen

Legg også merke til at koden her aksesserer elementer i nøkkel (og også i meldingsteksten) ved hjelp av en indeks. Tormod itererer over melding og nøkkel med en løkke som dette:

    for index in range(len(input)):
        ....
        ....

Jeg synes det er mere elegang (og enklere å forstå / fange opp feil) når man itererer over de faktiske elementene i stedet for en indeks range.

Til slutt må jeg kommentere at programmet konkatenerer ett-og-ett tegn på en output-streng, og det regner jeg i alle fall med er en god del mere kostbart enn å bygge opp en sekvens og f.eks. bruke en `join`-operasjon, slik som mange andre har gjort.

### Ulrich

[Kildekode](https://github.com/tormaroe/kodekamp-public/blob/kk1/1-One-Time-Pad/answers/ulrich.py)

Aller siste løsning: Ulrichs program bruker stort sett ting vi har sett før. For krypterings-operasjonen går han først en omvei om en bolsk variabel, men bruker så `add` og `sub` fra operator-modulen, slik jeg gjorde. Han bruker `zip` og en for-løkke for iterasjon, og konkatenerer ett-og-ett tegn til output. 

Jeg stusser litt over at løsningen til slutt kaller `join`, for argumentet til metoden er allerede en fullstendig streng. Det fungerer jo, men er unødvendig og sikkert en forglemmelse.

## Hvem vant?

Jeg har rangert bidragene etter et system jeg selv har kommet opp med, og kommet frem til at førsteplassen i kodekamp #1 deles mellom radarparet fra Computas: **Bjørn Einar Bjartnes** og **Einar Høst**. Bjørn Einar skåret bra på grunn av de eksekverbare kommentarene, mens Einar hadde en gjevnt god løsning med høy lesbarhet.

Gratulerer begge to, og takk igjen for at dere delte av deres enorme programmeringsforståelse :D

Så da det ser ut til at dere to også må delta i *neste kodekamp* om vi skal klare å skille dere :) 

Så følg med, kodekamp nummer 2 kommer snart!
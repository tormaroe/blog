---
title: "Komprimere tall"
layout: post
link: http://blog.kjempekjekt.com/2015/01/18/komprimere-tall/
date: 2015-01-18T12:20:09.661Z
tags:
  - JavaScript
  - Polyglot
---
I dag skal vi se litt på tallsystemer, og hvordan vi kan **komprimere** et tall ved å bruke mer enn bare de vanlige ti sifrene. Vi koder først i JavaScript - det universelle språket som "alle" skjønner - men mot slutten skal vi også se noen implementasjoner i andre programmeringsspråk.

Artikkelen er skrevet for dem som kanskje ikke har tenkt så mye på dette før. Jeg tror det er mange utviklere som trenger litt bedre forståelse av tallsystemer, og da er dette et forsøk på å forklare det på en lettfattelig og uformell måte.

## dit.ly

Jeg jobber med mobilkommunikasjon. Her om dagen *(eh, det er faktisk snart et år siden nå..)* fikk jeg behov for å lage en liten URL-redirecttjeneste ala [bit.ly](https://bitly.com/). Utfordringen var at vi trengte adresser som representerte ulike mobilnumre. Gitt et telefonnummer måtte jeg kunne generere en kort og fin URL (som ikke så ut som om den inneholdt et nummer), og gitt en URL måtte jeg kunne utlede hvilket nummer den representerte.

<p class="text-center"><img src="http://blog.kjempekjekt.com/uploads/2015/01/ditly.png"></p>

## Grunntall og tallsystemer

> **Grunntallet** (også kalt *radiks* eller *basetall*) er antallet unike siffer inkludert null, som brukes i et posisjonsbasert tallsystem. For eksempel har titallsystemet grunntallet ti, derfor kan én enkelt posisjon i tallet ikke få en større verdi enn ni før det blir nødvendig å øke verdien på neste posisjon. <small>Wikipedia</small>

Når jeg sier at telefonnummeret mitt er **4790696698** så er det nummerets representasjon i *titallsystemet*. I *to*tallsystemet ville vi derimot skrive **100011101100011000011101011111010**. Det tar litt lengre tid å taste inn, men til gjengjeld slipper vi unna med å lage telefoner med kun to taster :)

Vi kan lage mange tallsystemer med ulike grunntall. La oss si at vi var tegneseriefigurer og født med fire fingre på hver hånd. Da hadde vi brukt åttetallsystemet som har sifrene `0 1 2 3 4 5 6 7`, og nummeret mitt ville blitt **43543035372**.

Hva om vi har flere enn 10 fingre? Da må bruke andre tegn til å representere noen av sifrene. Og slik oppstår den vanlige representasjonen av 16-tallsystemet - såkalte hexadesimaler. Telefonnummeret mitt i *hex* er **11D8C3AFA**.

## Konvertere til grunntall X

Så hvordan har jeg kommet frem til disse ulike representasjonen av telefonnummeret mitt? La oss se på en liten funksjon jeg har laget som jeg kaller `toDigits`.

    var toDigits = function(num, base) {
      var digits = [];
      while(num > 0) {
        digits.unshift(num % base);
        num = Math.floor(num / base); 
      }
      return digits;
    };

Parameter `num` er et tall som skal konverteres til et annet tallsystem (enn titallsystemet), og `base` er grunntallet som sier hvilket tallsystem vi skal konvertere til. 

La oss teste funksjonen:

    toDigits(123, 10)  ; ===> [ 1, 2, 3 ]

Her sa jeg at jeg vil konvertere tallet 123 til 10-tallsystemet. Og siden vi går ut fra at vi allerede er i 10-tallsystemet så får vi ut et array med de samme sifrene.

Tenk deg at det første sifferet er _antall hundre_ (10*10), andre tallet er _antall tiere_, og siste tallet er _antall enere_.

La oss forsøke et lavere grunntall:

    toDigits(123, 5)  ; ===> [ 4, 4, 3 ]

Kult! Hvordan overbeviser vi oss selv om at dette er riktig? Siden vi er i femtallsystemet er første siffer nå _antall 25-ere_ (5*5), andre siffer er _antall 5-ere_ og siste siffer er fortsatt antall enere:

    4*25 + 4*5 + 3*1 = 100 + 20 + 3 = 123

## > 10

Hva med grunntall større enn 10? La oss forsøke 12...

    toDigits(123, 12)  ; ===> [10, 3]

Denne gangen endte vi opp med bare to siffer (hvis du går med på å kalle "10" et siffer. I normal hexadesimal-representasjon ville vi byttet ut 10 med `A`). Representasjonen vår av tallet har blitt komprimert fordi vi bruker et "rikere alfabet".

Her er regnestykket for å komme tilbake til titallsystemet:

    0*12*12 + 10*12 + 3*1 = 0 + 120 + 3 = 123

Vi kan også lage en liten funksjon som konverterer resultatet av `toDigits` tilbake til "normale" tall. La oss kalle den `fromDigits`:

    var fromDigits = function(digits, base) {
        return digits.reduce(function(acc, d) {
            return base * acc + d;
        }, 0);
    };

Siden jeg bruker `reduce` er det kanskje litt vanskelig å forstå hvordan den virker. La oss forsøke å analysere steg for steg hva som skjer når vi kaller `fromDigits([10, 3], 12)`, som vi forventer skal gi oss tilbake tallet 123.

<table class="table">
<thead>
<tr>
<th>Steg</th>
<th>acc</th>
<th>d</th>
<th>`base * acc + d`</th>
<th style="text-align:right">return</th>
</tr>
</thead>
<tbody>
<tr>
<td>#1</td>
<td>0</td>
<td>10</td>
<td>`12 * 0 + 10`</td>
<td style="text-align:right">10</td>
</tr>
<tr>
<td>#2</td>
<td>10</td>
<td>3</td>
<td>`12 * 10 + 3`</td>
<td style="text-align:right">123</td>
</tr>
</tbody>
</table>

## ditlyify og *un*-ditlyify

Nå er vi ikke langt unna funksjonene jeg trengte får å komprimere et telefonnummer til en kort streng. Det jeg nemlig valgte å gjøre var som du har skjønt å konvertere tallet med et *høyt* grunntall: **62**. Det er antall normale siffer + antall bokstaver i det engelske alfabetet ganger to (store og små bokstaver):

    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

For å konvertere telefonnummeret trenger jeg da bare å kalle `toDigits` med base 62, og så mappe sifferlisten jeg får ut med tegnet i riktig posisjon i alfabetet:

    var ditlyify = function(number) {
        return toDigits(number, alphabet.length).map(function (x) {
            return alphabet[x];
        }).join("");
    };

Legg merke til at det er `A` som er første siffer i min representasjon, ikke `0`. Dette gjorde jeg for å få færrest mulig tall i URL'en.

For å konvertere tilbake må vi mappe andre veien - fra *tegn* til *posisjon* - og så kalle `fromDigits`:

    var unditlyify = function(encoded) {
        var digits = encoded.split("").map(function(x) {
            return alphabet.indexOf(x);
        });
        return fromDigits(digits, alphabet.length);
    };

Og sånn lagde jeg vår interne URL-redirecttjeneste *dit.ly*.

## Ditlyify i andre språk
Jeg synes alltid det er interessant å sammenligne implementasjoner i ulike programmeirngsspråk. La oss se hvordan `ditlyify` vil kunne se ut i språkene C#, F# og Clojure.

### CSharp

Først ser vi på C#. Hovedforskjellen fra JavaScript er at vi må forholde oss til statisk typing, og må konvertere endel mellom `int`, `long` og `double`.

    public static string Ditlyify(string msisdn)
    {
        const string ALPHABET = 
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        int BASE = ALPHABET.Length;
        var digits = new Stack<int>();
        var num = Int64.Parse(msisdn);
        while (num > 0)
        {
            digits.Push((int)(num % BASE));
            num = Convert.ToInt32(Math.Floor((double) (num / BASE)));
        }
        return String.Join(String.Empty, digits.Select(x => ALPHABET[x]));
    }

### FSharp

La oss se på en mere funksjonell tilnærming. Vi kan konverte while-løkken fra JavaScript og C# til en rekursiv funksjon som bygger opp en liste. Deretter kan vi bruke _pipelining_ i slutten av `ditlyify` til å konvertere `msisdn` til en liste siffer i _base62_, mappe listen til alfabetet vårt, og så konkatenere bokstavene.

    let private alphabet = 
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    
    let private dBase = int64 alphabet.Length
    
    let ditlyify msisdn =
        let rec baseEncode digits = function
            | 0L  -> digits
            | num -> baseEncode ((num % dBase |> int) :: digits) 
                                (num / dBase)
        msisdn
        |> baseEncode List.empty<int>
        |> List.map (fun x -> string alphabet.[x])
        |> String.concat ""

Jeg synes også F#-koden inneholder noe mindre bråkete type-konverteringer enn C#.

### Clojure

For å lage en Clojure-implementasjon av `ditlyify` velger jeg nøyaktig samme fremgangsmåte som i F#. Clojure er derimot et dynamisk språk, så her er type-konverteringene fraværende.

    (def ALPHABET 
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789")
    
    (def BASE (count ALPHABET))
    
    (defn ditlyify [msisdn]
      (letfn [(base-encode [digits n]
                (if (zero? n)
                  digits
                  (recur (cons (mod n BASE) digits)
                         (quot n BASE))))]
        (->> msisdn
             read-string
             (base-encode ())
             (map (partial nth ALPHABET))
             (apply str))))

## Oppsummering

Det var en nokså lang blogpost om egentlig noe ganske lite. Men jeg tror det er endel som har bruk for denne kunnskapen; å kunne konvertere tall mellom ulike tallsystemer bør være et grunnleggende verktøy i utviklerens verktøybelte. Og å bruke dette til å komprimere og tilsynelatende også kryptere data er jo litt kult.
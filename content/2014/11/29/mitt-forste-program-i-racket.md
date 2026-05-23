---
title: "Mitt første program i Racket"
layout: post
link: http://blog.kjempekjekt.com/2014/11/29/mitt-forste-program-i-racket/
date: 2014-11-29T07:46:25.693Z
tags:
  - Lisp
  - Scheme
---
I går fikk jeg en forespørsel fra CFO'en vår som sa han trengte litt programmeringshjelp. Han hadde et par tusen kommaseparerte filer i en katalog, og trengte å samle siste rad i hver av filene inn i en ny fil.

Greit nok. Siden det ble fredagskvelden før jeg fikk gjort dette måtte jeg gjøre det litt gøy, så jeg valgte meg et programmeringsspråk jeg aldri har brukt før og satte i gang.

<p class="text-center"><img src="http://blog.kjempekjekt.com/uploads/2014/11/racket.jpg"></p>

Språket jeg valgte var **[Racket](http://racket-lang.org/)** (tidligere kalt *PLT Scheme*). Språket tilhører Lisp-familien, brukes / er tilrettelagt for undervisning, men er ikke noe "lekespråk" - det er raskt, har alt man trenger til de fleste oppgaver, og kommer med et eget utviklingsmiljø som kalles *DrRacket*. Språket er modent og godt dokumentert, og kan brukes på Windows, Linux og Mac.

## Enkelt å distribuere

En fordel med Racket er at det er enkelt å kompilere skripts til selvstendige, eksekverbare program som kan kopieres til en ny maskin og kjøres der - altså helt uten avhengigheter.

## Programmet

Jeg har [brukt Scheme på denne bloggen før](http://blog.kjempekjekt.com/tags/scheme/), og Racket er ikke helt ulikt. Så la meg bare presentere det lille programmet jeg har laget, med noen få kommentarer.

Jeg starter med en deklarasjon som forteller Racket hvilken dialekt av språket jeg vil bruke. Jeg *tror* at `racket/base` vil si at jeg kun bruker en liten basisdel av Racket.

    #lang racket/base

Så må jeg hente inn et par moduler jeg skal bruke:

    (require racket/file
             racket/list)

Når jeg koder i Lisp gjør jeg det ofte *bottom-up*, og det er sånn jeg presenterer det her nå. Den første funksjonen jeg trenger er en som kan avgjøre om en fil er en kommaseparert fil. Jeg baserer meg på om filnavnet ender i `.csv`

    (define (csv? path)
      (regexp-match #rx"\\.csv$" path))


Deretter lager jeg en funksjon som finner alle csv-filene i en katalog:

    (define (all-csv-files path)
      (filter csv? (directory-list path #:build? #t)))

Vi må også ha en funksjon som gir oss siste linje i en fil basert på stien til filen. Dette kan vi gjøre på denne måten:

    (define (last-row path)
      (string-append 
       (last (file->lines path #:mode 'text))
       "\n"))

*Når jeg tenker meg om så kan det hende jeg burde terminert linjene med \r\n i stedet for \n, men jeg går ut fra at filene skal åpnes i Excel, og at Unix-basert linjeskift fungerer greit der.*

Stien til katalogen programmet skal lete i ønsker jeg å sende inn som et argument til programmet. Jeg lager en funksjon `get-root` som sjekker at programmet har fått ett og bare ett argument, og returnerer dette:

    (define (get-root)
      (let ([args (current-command-line-arguments)])
        (if (equal? 1 (vector-length args))
            (vector-ref args 0)
            (error 'get-root 
                   "please provide the path as the only argument"))))

Nå trenger vi ikke deklarere flere funksjoner.

Måten jeg liker å løse slike utfordringer på er å lage et program som skriver ut resultatet sitt til kommandolinjen. Da slipper jeg å eksplisitt skrive til fil i koden, men kan enkelt sende output til en fil når jeg kjører programmet. Racket-funksjonen jeg bruker for å skrive til konsollet heter `display`.

Først skriver jeg ut en header:

    (display "Field1;Field2;Field3;osv..")
    (display "\n")

Og nå kan jeg til slutt hente stien som skal brukes (`root`), og skrive ut siste linje i hver av csv-filene jeg finner der:

    (let ([root (get-root)])
      (for ([csv-file (all-csv-files root)])
        (display (last-row csv-file)))) 

Og det var det hele. Etter å ha kompilert programmet til for eksempel `collectcsv.exe` kan jeg kjøre noe sånn som dette fra kommandolinjen i Windows for å gjøre jobben:

    collectcsv c:\path\to\files > result.csv

## Førsteinntrykk av Racket

Dette var en god opplevelse. Det var lett å finne informasjonen jeg trengte for å kode løsningen, og jeg støtte ikke på noen utfordringer. Utviklingsmiljøet DrRacket med en innebygd REPL var behagelig nok å bruke, og det var enkelt å lage en distribuerbar pakke.

Racket var egentlig helt perfekt for denne jobben, og er et språk jeg gjerne bruker mer.

Det gjenstår derimot å få bekreftet at CFO fikk til å bruke programmet, men jeg krysser fingrene...

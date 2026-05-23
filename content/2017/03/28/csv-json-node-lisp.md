---
title: "CSV, json, node, lisp, utf8 og closures"
layout: post
link: http://blog.kjempekjekt.com/2017/03/28/csv-json-node-lisp/
date: 2017-03-28T20:43:42.668Z
tags:
  - Common Lisp
  - Node.js
---

Her om dagen skulle jeg konvertere et sett med kommaseparerte filer (csv) til filer med json-linjer ([jsonl](http://jsonlines.org/)). Bare et utvalg av feltene fra csv'en skulle brukes og noen av verdiene skulle modifiseres underveis, så oppgaven var hakket mer kompleks enn at jeg ville gjøre det med for eksempel regex-transformasjoner i teksteditoren.

Om jeg forenkler problemet betraktelig kan du forestille deg at csv-filen så ut omtrent som dette:

```
SSN,FIRSTNAME,LASTNAME,YEAR_OF_BIRTH
987654321-0018,"Bob Kåre Jonny","Ingebrigtsen",1956
765432109-0144,"猪来了","属版",1987
543210987-1112,"Александр","Набатов",2001
```

Siden jeg synes det er veldig gøy med Common Lisp for tiden hadde jeg først lyst til å forsøke det, og [min parprogrammeringspartner](http://blog.kjempekjekt.com/2016/05/29/parprogrammering/) var villig til det. Vi fikk derimot raskt et problem med å lese inn filen, og siden vi hadde knapt med tid bestemte vi oss for å bytte til Node.js.

## Løsning i Node

Vi skrev *(det vil si mer eller mindre kopierte fra internett)* raskt et lite script omtrent som dette:

```
var csv = require('csv-parser')
var fs = require('fs')
 
fs.createReadStream('thefile.csv')
  .pipe(csv())
  .on('data', function (data) {
    var k = { 
      "id": data.SSN, 
      "given_name": data.FIRSTNAME, 
      "surname": data.LASTNAME, 
      "yob": data.YEAR_OF_BIRTH 
    };
    console.log("%j", k);
  })
```

Nå kunne vi fra kommandolinjen kjøre `node script.js > result.jsonl` og vi var i mål.

Siden json hører hjemme i JavaScript er Node egentlig det perfekte verktøyet for å skrive dette scriptet. Likevel hadde jeg veldig lyst til å få det til i Common Lisp, så etter arbeidstid gav jeg det et forsøk til...

## Løsning i Lisp

Utfordringen som stoppet oss ved første forsøk viste seg å være at csv-filen var kodet i utf-8. Min lisp ([SBCL](http://sbcl.org/)) på Windows antok at alt som leses inn til programmet er ISO-8859-1. Den missoppfattelsen rettet jeg opp ved å sette variabelen `*default-external-format*`.

Dermed kunne jeg lage en Lisp-løsning tilsvarende den vi allerede hadde i Node:

```
(use-package '(:read-csv :cl-json))

(setf sb-impl::*default-external-format* :UTF-8)

(with-open-file (s "thefile.csv")
  (let ((rows (cdr (parse-csv s))))
    (dolist (row rows)
      (encode-json 
       `((:id         . ,(nth 0 row))
         (:given_name . ,(nth 1 row))
         (:surname    . ,(nth 2 row))
         (:yob        . ,(nth 3 row))))
      (format t "~%"))))
```

`*default-external-format*` er ikke endel av Common Lisp standarden, men spesifikt for SBCL. Dermot kunne jeg i stedet ha brukt et bibliotek som heter **[alexandria](https://github.com/keithj/alexandria)** som blant annet inneholder et sett med forbedre funskjoner for å lese og skrive filer. Med funksjonen `with-input-from-file` får man mulighet til å spesifisere hvilken encoding man skal anta filen har:

```
(use-package :alexandria)

(with-input-from-file (s "thefile.csv"
                       :external-format :UTF-8)
  ; ...
  ; ...
  )
```

Om du seriøst ønsker å bruke Common Lisp til noe nyttig bør du ta en grundig titt på alexandria og hva det har å tilby.

## Funksjonell kolonneaksess

Til slutt måtte jeg leke med litt, og om du vil ha en liten utfordring kan forsøke å overbevise deg om at du skjønner hvordan dette fungerer.. 

Det som er litt kjipt med løsningen over er at csv-biblioteket ikke lar meg bruke kolonnenavnene til å hente ut feltverdiene, men må spesifisere kolonneindeks. For å løse den svakheten lagde jeg følgende funksjon som tar inn listen med kolonnenavn og returnerer en ny funksjon. Denne nye funksjonen en en closure *(let over lambda)* som tar to parametre - et kolonnenavn og en datarad - og finner så verdien via at den søker opp indeksen i listen av kolonnenavn:

```
(defun make-column-accessor (headers)
  (let* ((index -1)
         (next (lambda (name) (cons name (incf index))))
         (name-to-index-map (mapcar next headers)))
    (lambda (fieldname row)
      (let ((index (cdr (assoc fieldname name-to-index-map 
                               :test #'equalp))))
        (nth index row)))))
```

Nå kan jeg modifisere løsningen litt og bruke denne nye måten å hente ut feltene på:

```
(with-open-file (s "thefile.csv")
  (let* ((all (parse-csv s))
         (rows (cdr all))
         (get-column (make-column-accessor (car all))))
    (dolist (row rows)
      (macrolet ((col (name) `(funcall get-column ,name row)))
        (encode-json 
         `((:id         . ,(col "SSN"))
           (:given_name . ,(col "FIRSTNAME"))
           (:surname    . ,(col "LASTNAME"))
           (:yob        . ,(col "YEAR_OF_BIRTH"))))
          (format t "~%")))))
```

Her brukte jeg også en aldri så liten makro (se `macrolet`) til å forenkle syntaksen. Takket være den kan jeg skrive `(col "FOO")` som Lisp oversetter til uttrykket `(funcall get-column "FOO" row)`.

Løsningen i Node.js er fortsatt enklest, med Common Lisp er rett og slett morsommere :P

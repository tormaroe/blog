---
title: "Opp-ned-tall"
layout: post
link: http://blog.kjempekjekt.com/2015/12/15/opp-ned-tall/
date: 2015-12-15T10:45:39.753Z
tags:
  - Julekalender
  - Common Lisp
---

Luke 14 i [Knowit sin julekalender](https://julekalender.knowit.no/) ba oss om å..

> finne tall som kan leses likt når de blir rotert 180° (med andre ord; opp ned).
Sifrene vi kan tolke opp ned er 0, 1, 6, 8 og 9 og noen eksempler på tall som blir like opp ned er: 181, 916 og 8008.
> Din oppgave er å finne antall heltall, fra og med 0 til og med 100 000, som kan leses likt opp ned.

Jeg har to løsninger på denne oppgaven: Én kort en, og en litt lengre.

## Løsning nummer 1

I denne løsningen finner jeg svaret med ett enkelt uttrykk - ingen avhengigheter til noe annet ann hva som finnes i Common Lisp fra før. Den demonstrerer derimot et par ting jeg ikke har vist tidligere..

Det første av disse er det lispere kaller **property lists**, eller bare *plist*. En plist er egentlig en helt vanlig lenket liste, men annenhvert element behandles som en nøkkel, mens de andre elementene er verdiene. I praksis en veldig enkel hashmap. Den egner seg dårlig til store datamengder, men ofte kan den være svært praktisk. I koden nendefor er `digimap` en plist som sier hvilket tall jeg skal bytte ut et annet tall med.

Operasjonen jeg bruker for å hente ut en verdi av plisten er [`getf`](http://clhs.lisp.se/Body/f_getf.htm). Første parameter er listen, andre parameter er en nøkkel, og den valgfrie tredjeparameteren er en default verdi som returneres om nøkkelen ikke ble funnet.

```
(let ((digitmap 
       '(#\0 #\0 #\1 #\1 #\6 #\9 #\8 #\8 #\9 #\6)))
  (labels ((map-digit (x) (getf digitmap x #\?))
           (flip (x) (reverse (map 'string 
                                   #'map-digit 
                                   x))))
    (loop for i from 0 upto 100000
          for i-string = (format nil "~A" i)
          when (equal i-string (flip i-string))
          counting i)))
```

Det andre jeg ikke har brukt tidligere er [`labels`](http://www.lispworks.com/documentation/HyperSpec/Body/s_flet_.htm#labels). Du kan se på den som en variant av `let` som lar meg definere lokale funksjoner. Funksjonene jeg definerer her er `map-digit` og `flip`.

Resten av løsningen er en loop hvor jeg itererer over alle tallene, flipper dem, og så "teller" tallet om orginalen og det flippede taller er like. 

## Løsning nummer 2

Den andre løsningen (som faktisk er den jeg lagde først) er brutt opp i mindre funksjoner, bruker flere av biblotekene jeg har presentert i tidligere poster, og er rett og slett litt mere forseggjort: Jeg undersøker om tall kan flippes vha et regulært uttrykk, jeg flipper vha pattern matching, jeg bruker threading (`->>`) for å øke lesbarheten et par steder, og jeg sammenligner tall i stedenfor strenger.

Her er den komplette løsningen:

```
(ql:quickload :cl-ppcre)
(ql:quickload :cl-arrows)
(ql:quickload :optima)

(use-package :cl-arrows)
(use-package :optima)

(defun parse-any-value (x)
  (with-input-from-string (in x)
    (read in)))

(defun any-value-to-string (x)
  (format nil "~A" x))

(defun can-flip-p (x)
  (cl-ppcre:scan "^[01689]+$" x))

(defun flip-digit-char (x)
  (match x
    (#\6 #\9)
    (#\9 #\6)
    (otherwise x)))

(defun flip-digit-string (x)
  (->> x
       (map 'string #'flip-digit-char)
       reverse))

(defun equal-flipped-p (x)
  (let ((x-string (any-value-to-string x)))
    (when (can-flip-p x-string)
      (= x (->> x-string 
                flip-digit-string
                parse-any-value))))) 

(defun solve ()
  (loop for i from 0 upto 100000
        when (equal-flipped-p i)
        counting i))
```

.. og dermed var det bare 9 dager igjen til Jul!
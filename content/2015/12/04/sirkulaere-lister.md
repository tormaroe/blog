---
title: "Sirkulære lister"
layout: post
link: http://blog.kjempekjekt.com/2015/12/04/sirkulaere-lister/
date: 2015-12-04T06:30:10.403Z
tags:
  - Common Lisp
  - Julekalender
---

![Circular list](http://blog.kjempekjekt.com/uploads/2015/12/circular.jpg)

Denne bonus-posten beskriver hvordan jeg løste den tredje oppgaven i [Knowit sin julekalender](https://julekalender.knowit.no/) med Common Lisp. Oppgaven gikk ut på å telle antall forekomster av "programmerernes dag" på fredager, fra år 1 til og med 2015, gitt normale skuddårsregler. Programmerernes dag er dag nummer 256 i året.

Først klarte jeg ikke å løse den - svaret mitt ville ikke godtas. Men så ble det kommentert at vi skulle begynne å telle dagene i året fra dag null, og da ble det riktig.

Jeg bruker disse oppgavene til å lære meg nye ting i Common Lisp, og denne gangen prøvde jeg meg på sirkulære lister. Jeg tenkte det kunne være en ideell datastrukture for å representere dagene: En uke består av syv dager, men etter søndag kommer mandag igjen, i en uendelig syklus.

Her er en funksjon som gitt en rekke elementer produserer en linket liste hvor siste celle peker tilbake på starten:

```
(defun circular (first &rest rest)
  (let ((items (cons first rest)))
    (setf (cdr (last items)) items)))
```

Og sånn oppretter jeg listen:

```
(defvar *days*
  (circular :friday ;; 01.01.0001
  	        :saturday
  	        :sunday
  	        :monday
  	        :tuesday
  	        :wednesday
  	        :thursday))
```

Oppgaven sa at 1. januar i år 1 skulle være en fredag, så da var det like greit at listen startet der.

Jeg trengte også noen funksjoner som finner ut om et år er et skuddår eller ikke, og basert på det hvor mange dager det er i året:

```
(defun divisiblep (dividend divisor)
  (zerop (rem dividend divisor)))

(defun leapyearp (year)
  (cond ((not (divisiblep year 4)) nil)
  	    ((not (divisiblep year 100)) t)
  	    ((not (divisiblep year 400)) nil)
  	    (t t)))

(defun days-in-year (year)
  (if (leapyearp year) 366 365))
```

Nå kan vi også lage en hjelpefunksjon som sjekker om en dag er *programmerernes dag*:

```
(defun programmerdayp (day-num day-of-week)
  (and (= day-num 257) ; Start counting at zero!
       (eq day-of-week :friday)))
```

Det var her jeg måtte justere litt for å få riktig svar, basert på at vi skulle starte på null.

Løsningen min inneholder også en liten convenience macro for å forkorte noen av if-teste mine. `inc-if` incrementerer en verdi hvis en verdi er sann, hvis ikke returneres verdien som den er. Jeg gjorde dette mest for å trene på makroer, som er viktige i Lisp.

```
(defmacro inc-if (p x)
  `(if ,p (1+ ,x) ,x))
```

Med denne kan jeg for eksempel redefinere `days-in-year` slik:

```
(defun days-in-year (year)
  (inc-if (leapyearp year) 365))
```

Selve funksjonen som søker seg frem til løsningen er rekursiv og itererer over alle dager fra start til vi når år 2016. Merk at jeg ikke bruker noe form for datobjekt (jeg tror ikke Common Lisp i utgangspunktet har det), men holder track på hvilket år vi holder på med, hvilken dag i året vi er på, hvor mange dager det er i året, hvilken ukedag det er, osv. Skikkelig brute force gjennomspoling altså. 

Siden jeg har så mange som fem parametre så bruker jeg *keyword-parametre* for å gjøre det mere leservennlig.

```
(defun process-days (&key year days-in-year day-num days acc)
  (if (= year 2016)
    acc
    (let* ((new-year-p (= day-num days-in-year))
           (next-year (inc-if new-year-p year)))
      (process-days 
        :year next-year
        :days-in-year (if new-year-p 
                        (days-in-year next-year) 
                        days-in-year)
        :day-num (if new-year-p 1 (1+ day-num))
        :days (cdr days)
        :acc (inc-if (programmerdayp day-num (car days)) acc)))))
```

Mye pirk der. Løsningen hadde nok blitt vakrere om jeg hadde definert ett eller annet objekt som holdt track på itererings-tilstanden. Men la gå..., nå gjenstår det bare å finne svaret:

```
(format t "Answer is ~A~%"
  (time
    (process-days :year 1
                  :days-in-year (days-in-year 1)
                  :day-num 1
                  :days *days* ; Den sirkulære listen..
                  :acc 0)))
```

Som gav output:

```
;; Evaluation took:
;;   0.025 seconds of real time
;;   0.031250 seconds of total run time (0.031250 user, 0.000000 system)
;;   124.00% CPU
;;   69,211,168 processor cycles
;;   0 bytes consed
;; 
;; Answer is 288
```

Rekursjon i Common Lisp er i alle fall ikke tregt ;)
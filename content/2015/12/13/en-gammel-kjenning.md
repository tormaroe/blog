---
title: "En gammel kjenning"
layout: post
link: http://blog.kjempekjekt.com/2015/12/13/en-gammel-kjenning/
date: 2015-12-13T11:48:36.498Z
tags:
  - Julekalender
  - Common Lisp
---

Lørdag morgen våknet jeg opp på et hotellrom med utsikt over Bergen sentrum, etter et hyggelig julebord med kolleger og ektefeller. Og noe av det første jeg gjorde var selvfølgelig å åpne luke 12 i [Knowit sin julekalender](https://julekalender.knowit.no/). Den inneholdt følgende oppgave:

> Finn summen av alle tall fra og med 1 og til og med 100 000 000 som er har 7 som en divisor, og samtidig IKKE har 5 som en divisor.

Oy, det lød kjent! Det er jo *nesten* Project Euler-oppgave nummer 1, som jeg har løst snørrogførti ganger i ørten språk her på bloggen. Jeg installerte raskt [Steel Bank Common Lisp](http://www.sbcl.org/) på Asus Transformeren jeg hadde med meg, og bruteforce-itererte hundre millioner ganger for å finne svaret:

```
(loop for i from 1 to 100000000
      when (and (zerop (mod i 7))
                (not (zerop (mod i 5))))
      summing i)
``` 

Dette tok 5 milliarder prosessorsykler og 3,5 sekunder. Til sammenligning kjørte jeg samme koden på Lenovo ThinkPad'en min senere på dagen, og da gikk det samme unna på 0,6875 sekunder.

## En forbedring: Mengder

Etter å ha fått svaret godkjent ville jeg forsøke en litt smartere løsning. Jeg tenkte på oppgaven som et mengde-problem: Mengden av alle multipler av 7 *minus* mengden av alle multipler av 7 ganger 5 (altså delelige på både 7 og 5). Dermed kunne jeg iterere over langt færre tall, og unngå alle modulo-operasjonene:

```
(let (sum)
  (setf sum (loop for i = 7 then (+ i 7) 
                  until (> i 100000000) 
                  summing i))
  (decf sum (loop for i = (* 5 7) then (+ i (* 5 7))
                  until (> i 100000000)
                  summing i)))
```

Denne gangen - fortsatt på Asus'en - fant jeg løsningen 0,828125 sekunder og 1,2 milliarder sykler (0,59375 sekunder på Lenovo'en).

Forresten, jeg trenger ikke noen variabel til å holde på summen, jeg kan jo bare trekke den ene fra den andre direkte:

```
(- (loop for i = 7 then (+ i 7) 
         until (> i 100000000) 
         summing i)
   (loop for i = (* 5 7) then (+ i (* 5 7))
         until (> i 100000000)
         summing i))
```

Dette gav ingen forbedret kjøretid, men er uansett enklere.

## En forverring: Range->Filter->Reduce

Bare for gøy ville jeg også forsøke å bruke en mer funksjonell fremgangsmåte, hvor jeg først produserer alle multipler av 7, så filtrerer bort alle multipler av 5, og så summerer opp. Common Lisp har ingen range-funksjon, men vi kan enkelt lage en basert på loop-makroen: 

```
(defun range (max &key (min 0) (step 1))
  (loop for n from min below max by step
    collect n))
```

Som så mange ganger før bruker jeg pakken `cl-arrows` til å kjede sammen stegene:

```
(->> (range 100000001 :step 7)
     (remove-if (lambda (x) (zerop (mod x 5))))
     (reduce #'+))
```

Denne løsningen gav meg svaret etter 2,657 sekunder. Jeg var på Lenovo'en nå, så dette var altså 2 sekunder dårligere enn den første løsningen som itererte over alle tallene.

Det som var mere interessant var at 1,687 av sekundene (63%) ble brukt til *garbage collection*. Og enda mer interessant - om jeg kjørte denne koden 5 eller 6 ganger etter hverandre så fikk jeg en fatal *Heap exhausted* error og meldingen *"game over"*! SBCL likte tydeligvis ikke denne måten å løse oppgaven på :)

## Uavgjort: Rekursjon

Nå hadde jeg fått blod på tann. Jeg kunne ikke stoppe med noe som Common Lisp ikke var bra på, så nå ville jeg teste rekursjon, og lagde denne funskjonen:

```
(defun recursive-solve (&key (n 0) (acc 0))
  (if (< 100000000 n)
    acc
    (recursive-solve 
      :n (+ 7 n)
      :acc (if (zerop (mod n 5))
             acc
             (+ acc n)))))
```

`(recursive-solve)` gav meg riktig svar på 0,7 sekunder, med bare noen få millisekunder brukt til garbage collection. *Basically* var dette like bra som første løsning, men ikke så bra som løsningen hvor jeg unngikk modulo-testene.

Greit nok.

Igjen har jeg klart å skrive en laaaang blogpost om en veeeeeldig enkel programmeringsoppgave, og sånn ble det bare 11 dager igjen til Jul!
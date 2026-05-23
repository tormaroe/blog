---
title: "Optimalisering og gradvis typing i Common Lisp"
layout: post
link: http://blog.kjempekjekt.com/2015/12/28/declare-optimize-speed/
date: 2015-12-28T20:11:01.664Z
tags:
  - Common Lisp
  - Ytelse
---

![Kjøretidsforbedringer](http://blog.kjempekjekt.com/uploads/2015/12/performance.png)

I boken *[Paradigms of Artificial Intelligence Programming](http://norvig.com/paip.html)* presenterer Peter Norvig seks ulike teknikker for mikrooptimalisering av kode som skviser mer ytelse ut av Common Lisp.

Norvig sier at man kan få bedre ytelse om man unngår generiske funksjoner, unngår funksjoner med komplekse parameterlister, og unngår unødvendig *[consing](http://stackoverflow.com/questions/2256261/why-is-consing-in-lisp-slow)* (minneallokering). Han foreslår å bruke mere optimale datastrukturer (som hashtabell i stedet for association list), og han foreslår å bruke makroer for å kompilere for å flytte deler av kompleksiteten fra runtime til compile time.

Men tipset jeg skal se nærmere på i denne artikkelen er å bruke det Common Lisp kaller **deklarasjoner**. Vi bruker `declare` til å gi Lisp instruksjoner om hvordan den skal kompilere koden vår.

## Løpe i trapper

Oppgaven jeg vil løse og så optimalisere denne gangen er hentet fra luke 19 i Knowit sin julekalender for utviklere. Oppgaven lød:

> Et barn løper opp en trapp med 30 trinn, 
> og kan ta enten ett, to eller tre steg 
> omgangen. Hvor mange ulike måter kan 
> barnet løpe opp trappen?

Jeg skal etterhvert implementere syv varianter av en rekursiv løsning på dette problemet, og hver gang skreller vi av litt av kjøretiden. Her er en utlisting av mine målinger: 

```
* (load "oppgave19")

53798080 returned in 1.563 seconds by (WALK-STEPS-1 30 0).
53798080 returned in 1.496 seconds by (WALK-STEPS-2 30).
53798080 returned in 0.863 seconds by (WALK-STEPS-2B 30).
53798080 returned in 0.644 seconds by (WALK-STEPS-2C 30).
53798080 returned in 0.350 seconds by (WALK-STEPS-3 30).
53798080 returned in 0.168 seconds by (WALK-STEPS-3B 30).
53798080 returned in 0.124 seconds by (WALK-STEPS-3C 30).
```

Som du kan se oppnår jeg en reduksjon i kjøretiden fra værste til beste på 92%.

## Første forsøk

Her er min orginale løsning som jeg brukte til å svare på kalenderoppgaven fra Knowit:

```
(defun walk-steps-1 (s acc)
  (if (zerop s)
    (1+ acc) ; End of stairs reached, count now!
    (+ (walk-steps-1 (- s 1) acc)
       (if (>= s 2) (walk-steps-1 (- s 2) acc) 0)
       (if (>= s 3) (walk-steps-1 (- s 3) acc) 0))))
```

Det jeg gjør her er å rekursivt utforske treet av alle mulige måter å gå på. Hvis det bare er ett trinn igjen å gå så har vi bare én kombinasjon. Ellers må vi summere kombinasjonene for ett trinn, to trinn og tre trinn (gitt at vi har så mange trinn).

Løsningen ble funnet på drøye 1,5 sekunder.

## Akkumuleringsvariabel unødvendig

Etter å ha levert løsningen oppdaget jeg at å bruke en akkumuleringsvariabel (`acc`) faktisk var helt unødvendig; det var nok en kombinasjon av vane og tidspress som gjorde at jeg brukte det.

Jeg kan enkelt fjerne `acc`, som gjør funksjonen litt enklere:

```
(defun walk-steps-2 (s)
  (if (zerop s)
    1 ; End of stairs reached, count now!
    (+ (walk-steps-2 (- s 1))
       (if (>= s 2) (walk-steps-2 (- s 2)) 0)
       (if (>= s 3) (walk-steps-2 (- s 3)) 0))))
```

Denne endringen skrelte bort ca 5% av kjøretiden. Ikke mye, men det er en begynnelse. 

## Deklarer parametertypen

Nå skal vi forsøke å bruke `declare`, som vil la oss fortelle kompilatoren at argumentet `s` er av typen `fixnum` - dvs. en integer mellom -536870912 og 536870911 (i Common Lisp-implementasjonen jeg bruker).

Jeg legger til én linje i funksjonen min:

```
(defun walk-steps-2b (s)
  (declare (fixnum s))
  (if (zerop s)
    1 ; End of stairs reached, count now!
    (+ (walk-steps-2b (- s 1))
       (if (>= s 2) (walk-steps-2b (- s 2)) 0)
       (if (>= s 3) (walk-steps-2b (- s 3)) 0))))
```

Denne teknikken gir oss altså muligheten for å gradvis tilføre statisk typing, der hvor det gir fordeler...

..og fordelen vi oppnår i dette tilfellet er en ytelsesforbedring på ytterligere 42%. Nå snakker vi!

## Optimaliser for ytelse

Men vi kan bruke `declare` til flere ting; vi kan fortelle kompilatore hva vi ønsker den skal optimalisere for: *kompileringshastighet, debuggingsfasiliteter, runtime error checking, minnebruk, eller kjøretidsytelse*.

La oss prøve å si at vi vil optimalisere for hastighet, og samtidig at vi *gir beng* i sikkerhet:

```
(defun walk-steps-2c (s)
  (declare (optimize speed (safety 0)))
  (declare (fixnum s))
  (if (zerop s)
    1 ; End of stairs reached, count now!
    (+ (walk-steps-2c (- s 1))
       (if (>= s 2) (walk-steps-2c (- s 2)) 0)
       (if (>= s 3) (walk-steps-2c (- s 3)) 0))))
```

Dette skreller av enda 25% av kjøretiden - de to deklarasjonene kombinert reduserer nå tiden med totalt 57%. Når vi snakker om mikrooptimalisering (uten å endre logikken) så er det et ganske så bra resultat.

## Smartere rekursjon

Men nå har jeg fått blod på tann, og jeg har fått lyst til å se hvor mye jeg klarer å forbedre løsningen. Ved å endre litt på rekursjonen kan jeg skvise ut enda mer ytelse.

Jeg baserer meg på at jeg vet hvor mange kombinasjoner to og tre trappetrinn utgjør, og unngår mange rekursive funksjonskall ved å hardkode løsningene for `s` mindre enn eller lik 3.

```
(defun walk-steps-3 (s)
  (cond
    ((= s 0) 1)
    ((= s 1) 1)
    ((= s 2) 2)
    ((= s 3) 4)
    (t (+ (walk-steps-3 (- s 1))
          (walk-steps-3 (- s 2))
          (walk-steps-3 (- s 3))))))
```

Mens den orginale løsningen gjorde nesten 118 millioner funksjonskall gjør denne nye løsningen knappe 31 millioner. Det utgjør en reduksjon i kjøretiden på mer enn 76%.

Om vi så bruker de samme deklarasjonene som tidligere så blir det enda bedre:

```
(defun walk-steps-3b (s)
  (declare (optimize speed (safety 0)))
  (declare (fixnum s))
  (cond
    ((= s 0) 1)
    ((= s 1) 1)
    ((= s 2) 2)
    ((= s 3) 4)
    (t (+ (walk-steps-3b (- s 1))
          (walk-steps-3b (- s 2))
          (walk-steps-3b (- s 3))))))
```

Vi har nå redusert den orginale kjøretiden med nesten 90%. Men vi har en typedeklerasjon til vi kan forsøke.. 

## Deklarer returtype

Common Lisp har en operator som kalles `the`. Den kan brukes til å si ting som `(the fixnum (+ 5 7))`, som da er en garanti til kompilatoren at resultatet av 5 pluss 7 vil være et fixnum.

La oss forsøke å garantere at resultatet av vår summeringsoperasjon er et fixnum:

```
(defun walk-steps-3c (s)
  (declare (optimize speed (safety 0)))
  (declare (fixnum s))
  (cond
    ((= s 0) 1)
    ((= s 1) 1)
    ((= s 2) 2)
    ((= s 3) 4)
    (t (the fixnum 
         (+ (walk-steps-3c (- s 1))
            (walk-steps-3c (- s 2))
            (walk-steps-3c (- s 3)))))))
```

Dette gir alene en 26% reduksjon i kjøretid, som er ganske utrolig, og totalt har vi nå oppnådd 92% reduksjon.

## Benchmarking

Profilering er essensielt når man driver med ytelsesforbedringer - aldri forsøk uten! For å måle kjøretiden til de ulike funksjonene mine har jeg laget en makro jeg har kalt `benchmark`. Den bruker `get-internal-real-time` til å se hvor mange millisekunder som brukes på en vilkårlig operasjon, og rappoerterer dette.

```
(defmacro benchmark (expr)
  (let ((start (gensym)) 
        (end (gensym))
        (result (gensym)))
    `(let ((,start (get-internal-real-time))
           (,result ,expr)
           (,end (get-internal-real-time)))
       (format t "~&~a returned in ~,3f seconds by ~a.~%"
          ,result 
          (/ (- ,end ,start) 1000.0)
          (quote ,expr)))))
```

Nå kan vi teste funksjonene på denne måten:

```
(benchmark (walk-steps-1 30 0))
(benchmark (walk-steps-2 30))
(benchmark (walk-steps-2b 30))
(benchmark (walk-steps-2c 30))
(benchmark (walk-steps-3 30))
(benchmark (walk-steps-3b 30))
(benchmark (walk-steps-3c 30))
```

Og resultatet så du i starten av artikkelen.

## Oppsummering

Som jeg har demonstrert kan deklarasjoner i Common Lisp gi en stor ytelsesforbedring. Som regel er Common Lisp mer enn raskt nok, men når man faktisk trenger å presse ned kjøretiden er det greit å vite at man har denne muligheten.

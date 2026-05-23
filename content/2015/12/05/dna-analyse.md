---
title: "DNA-analyse med Common Lisp"
layout: post
link: http://blog.kjempekjekt.com/2015/12/05/dna-analyse/
date: 2015-12-05T07:52:53.315Z
tags:
  - Common Lisp
  - Julekalender
  - Esoteriske språk
---

Jeg fortsetter å løse oppgavene fra [Knowit sin julekalender](https://julekalender.knowit.no/) ved hjelp av Common Lisp. Luke 4 var ganske triviell; vi skulle rett og slett telle antall forekomster av de fire ulike basene i en passe lang DNA-sekvens.

Først lager vi en variabel som holder på sekvensen (forkortet her av estetiske grunner):

```
(defvar *dna* "TAACGAGTCTGCC...")
```

Og så kunne jeg løse oppgaven rett og slett ved å bruke funksjonen `count`:

```
(format t "A~A, C~A, G~A, T~A~%"
  (count #\A *dna*)
  (count #\C *dna*)
  (count #\G *dna*)
  (count #\T *dna*))
```

Løsningen er grei den, men jeg syntes det var lite tilfredstillende å kalle `count` fire ganger. DNA-sekvensen må jo da traverseres fire ganger, og om det var en veldig lang sekvens det var snakk om så vil jo det koste unødvendig med CPU-sykler.

Derfor lagde jeg i stedet en løsning som bruker `loop`-makroen til å traversere sekvensen én gang. Jeg lager en liste med fire tall som jeg muterer underveis basert på hvilken bokstav jeg støter på. 

```
(loop for char across *dna*
  with (adenin cytosin guanin tymin) 
     = (list 0 0 0 0)
  when (eq char #\A) do (incf adenin)
  when (eq char #\C) do (incf cytosin)
  when (eq char #\G) do (incf guanin)
  when (eq char #\T) do (incf tymin)
  finally (format t "A~A, C~A, G~A, T~A~%" 
            adenin cytosin guanin tymin))
```

Denne løsningen ble rett og slett mye gøyere. Det mest krevende var å skumme internett for å finne ut at jeg måtte bruke `across` når jeg skal iterere over elementene i en streng (og ikke `in` som brukes for lister).

##Esoteriske løsninger

Det er forresten interessant å se alle løsningene som folk poster i kommentartråden til lukene. Det er et hav av ulike språk i sving her, og denne luken ble blant annet løst i **[ABAP](https://en.wikipedia.org/wiki/ABAP)** av KjetilK. *Kudos!* Brukeren som kaller seg Suppen løste oppgaven i et esoterisk språk som heter **[Fish](https://esolangs.org/wiki/Fish)**. Slik så det ut:

```
042p0b2p0a8+2p0aa5++2p01.
>i:"A"=?v:"C"=?v:"G"=?v:"T"=?v01-=?!v  v>v>v
    n   ~  n   ~  n   ~  n   ~      0  "n"o5
        4      b      a      5      1  AgGo5
        2      2      8      5      >. "2 o*
        g      g      +      *         ob,"2
        1      1      2      2         4o",g
        +      +      g      g         2oo n
        4      b      1      1         gooT;
                      +      +         n"o"
                      a      5         ",an
                      8      5         C 8g
                      +      *         ""+2
^p2<<<<<<<<<<<<<<<<<<<<<<<<<<<         >^>^
```

Og Pantheon løste oppgaven i språket **[Pyth](https://pyth.readthedocs.org/en/latest/)** med dette lille programmet: 

```
FNcS{z1NsmqNdz
```

Genialt! Denne quizen ble rett og slett så gøy som folk gjorde den til selv. Og ikke minst kjekt å se at jeg ikke er alene i norge om å synes sånt er underholdende å holde på med :)

Men nå håper jeg på en mere utfordrende oppgave i neste luke ;)
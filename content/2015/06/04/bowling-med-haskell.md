---
title: "Bowling med Haskell"
layout: post
link: http://blog.kjempekjekt.com/2015/06/04/bowling-med-haskell/
date: 2015-06-04T12:03:14.998Z
tags:
  - Haskell
  - Polyglot
  - Pattern matching
---

![Bowling](http://blog.kjempekjekt.com/uploads/2015/06/bowling.jpg)

Jeg har lekt meg litt med [Haskell](http://blog.kjempekjekt.com/2011/12/07/haskell/) igjen. Jeg kjøpte en bok om programmeringsspråket for lenge siden, som jeg aldri har lest meg gjennom.., men av og til titter jeg i den, og får lyst til å prøve litt.

Denne gangen tenkte jeg å implementere en enkel løsning på *bowling game kata* som jeg viste tidligere i F# og Erlang ([post fra 2011](http://blog.kjempekjekt.com/2011/11/18/likheter-mellom-f-og-erlang/)). Jeg skal gjengi de to implementasjonene her før jeg viser hva jeg ha gjort i Haskell - sånn at du kan sammenligne hvordan det ser ut.

## Bowling game kata?

Oppgaven er bare å lage en funksjon som kan gi poengresultatet av et bowling-spill. Spillet er representert som en liste med antall kjegler man har fått ned pr kast. Jeg lagde en video hvor jeg demonstrerte dette i Clojure også, og hvor jeg gjorde det test-drevet.

## FSharp

Løsningen i F# er stjålet fra Christian Abildsø:

    let rec CalcFrame rolls frame =
        match rolls with
            | _ when frame = 10         -> 0
            | 10::y::z::rest            -> 10+y+z + CalcFrame (y::z::rest) (frame+1)
            | x::y::z::rest when x+y=10 -> 10+z   + CalcFrame (z::rest)    (frame+1)
            | x::y::rest                -> x+y    + CalcFrame rest         (frame+1)
            | _                         -> 0
    
    let CalculateScore rolls = CalcFrame rolls 0 

## Erlang

Basert på løsningen i F# gjorde jeg min egen i Erlang:

    calc_frame(Rolls, Frame) ->
      case Rolls of
        _ when Frame == 10        -> 0;
        [10,Y,Z|Rest]             -> 10+Y+Z + calc_frame([Y,Z|Rest], Frame+1);
        [X,Y,Z|Rest] when X+Y==10 -> 10+Z   + calc_frame([Z|Rest], Frame+1);
        [X,Y|Rest]                -> X+Y    + calc_frame(Rest, Frame+1);
        _                         -> 0
      end.
    
    calculate_score(Rolls) -> calc_frame(Rolls, 0).

## Haskell - første forsøk

Full disclaimer: Jeg er helt nybegynner i Haskell - har gjort minimalt. Det jeg forsøkte her var å bruke det jeg kunne av språket til å implementere den samme løsningen som du har sett over.

Haskell har en `case .. of` ala F#/Erlang, men såvidt jeg kunne se har den ikke `when` guards. I stedet valgte jeg å splitte funksjonsdefinisjonen opp og bruke pattern matching i signaturen.

    calcFrame :: Int -> [Int] -> Int
    calcFrame 10 _          = 0
    calcFrame n (10:y:z:xs) = calcFrame (n+1) (y:z:xs) + 10+y+z
    calcFrame n ( x:y:z:xs) = calcFrame (n+1) (z:xs) 
                              + if x + y == 10
                                then 10+z 
                                else x+y
    calcFrame n ( x:y:xs)   = calcFrame (n+1) xs + x+y
    calcFrame _ _           = 0 
    
    score :: [Int] -> Int
    score = calcFrame 0

Det fungerte, men ble (synes jeg) ikke spesielt vakkert.

Jeg lagrer koden i filen `Bowling.hs`, fyrer opp [GHCi](https://downloads.haskell.org/~ghc/latest/docs/html/users_guide/ghci.html) (interaktiv Haskell), og kompilerer og laster funksjonen med kommandoen `:load Bowling`.

Så kan jeg teste funksjonen direkte ved å for eksempel si:

    score [10,10,10,10,10,10,10,10,10,10,10,10]

.. som er et perfekt spill, og gir 300 poeng :)

## Haskell - andre iterasjon

Etter litt googling fant jeg ut at jeg kunne bruke én funksjonsdefinisjon med guards, og at jeg kunne bruke funksjoner i guardene. Så jeg prøvde det, og er mer fornødy med dette resultatet:

    calcFrame :: Int -> [Int] -> Int
    calcFrame n xs
      | n == 10     = 0
      | strike   xs = sum (take 3 xs) + next (drop 1 xs)
      | spare    xs = sum (take 3 xs) + next (drop 2 xs)
      | hasFrame xs = sum (take 2 xs) + next (drop 2 xs)
      | otherwise   = 0
      where
        strike xs      = head xs == 10
        spare (x:y:xs) =   x + y == 10
        spare []       = False
        hasFrame xs    = length xs > 1 
        next           = calcFrame $ n + 1
    
    score :: [Int] -> Int
    score = calcFrame 0

Her bruker jeg også `where`, som er en slags omvendt `let`; definisjonene av verdier jeg bruker i første del kommer etter `where`. Ved å definere funksjoner som `strike`, `spare` og `hasFrame` har jeg gjort algoritmen mere lesbar.

Jeg bruker også mer av Haskell her. Her er typesignaturene til funksjoner som er brukt i iterasjon to:

    head :: [a] -> a
    take :: Int -> [a] -> [a]
    drop :: Int -> [a] -> [a]
    sum :: Num a => [a] -> a
    length :: [a] -> Int
    ($) :: (a -> b) -> a -> b

Den siste der kaller *application operator*, og er i praksis bare litt sukker som gjør at jeg ikke behøver å bruke paranteser i definisjonen av funksjonen `next`. Haskellianere bruker `$` nokså mye, så det er greit å øve litt på den..

## Haskell - tredje iterasjon

Jeg dupliserer litt mye listeoperasjoner i løsningen over - bruken av sum, take og drop. Jeg forsøkte ulike ting for å få dette "bedre", og endte til slutt opp med dette:

    calcFrame :: Int -> [Int] -> Int
    calcFrame n xs
      | n == 10     = 0
      | strike   xs = sumRolls 3 + nextWithout 1
      | spare    xs = sumRolls 3 + nextWithout 2
      | hasFrame xs = sumRolls 2 + nextWithout 2
      | otherwise   = 0
      where
        strike xs      = head xs == 10
        spare (x:y:xs) =   x + y == 10
        spare []       = False
        hasFrame xs    = length xs > 1 
        next           = calcFrame $ n + 1
        sumRolls       = sum . flip take xs
        nextWithout    = next . flip drop xs
        
    score :: [Int] -> Int
    score = calcFrame 0

Enda litt flere abstraksjoner nå - om det gjør det enklere eller vanskeligere å forstå koden kan diskuteres.

Nye ting jeg lærte meg og brukte her:

    flip :: (a -> b -> c) -> b -> a -> c
    (.) :: (b -> c) -> (a -> b) -> a -> c

`flip` er en funksjon som endrer rekkefølgen på parametrene til en annen funksjon. Punktum bruker for *funksjonskomposisjon* - å slå sammen to funksjoner. Jeg brukte dette til å implementere `sumRolls` og `nextWithout` i såkalt *point-free style*, nevnt for ikke så lenge siden i posten [reverser deg frem til svaret](http://blog.kjempekjekt.com/2015/04/02/reverser-deg-frem-til-svaret/).

## Sirkelen sluttes

Da jeg begynte å skrive denne posten for å dokumentere hva jeg hadde gjort, kom jeg på at Christian (som implementerte F#-løsningen) i 2011 kommenterte at hans kode egentlig var en portering av en løsning han hadde gjort i Haskell!!!

... og i [en blogpost fra mars 2010](http://codernub.blogspot.no/2010/03/bowling-kata-as-haskell-exercise-first.html) fant jeg også den:

    calculateScore :: (Num a) => [a] -> a
    calculateScore rolls = scoreFrame rolls 0 0
         
    scoreFrame :: (Num a) => [a] -> a -> a -> a
    scoreFrame rolls score 10 = score
    scoreFrame [x,y] score frame = score+x+y
    scoreFrame (x:y:z:rest) score frame
        | x == 10     = scoreFrame (y:z:rest) (score+x+y+z) (frame+1)
        | x + y == 10 = scoreFrame (z:rest)   (score+x+y+z) (frame+1)
        | otherwise   = scoreFrame (z:rest)   (score+x+y)   (frame+1)

Mer behagelig å se på enn alle mine forsøk.

Rekursjonen er litt anderledes; han akkumulerer scoren underveis, og returnerer denne når han kommer til enden av listen, i stedet for der å returnere 0 og så "poppe" tilbake gjennom de rekursive kallene. Denne siste implementasjonen er altså *halerekursiv*. Halerekursjon - som jeg har snakket om mange ganger - er ofte en nødvendig optimalisering i funksjonelle språk, men utgjør ingen forskjell når vi snakker om så korte lister som et bowlingspill.
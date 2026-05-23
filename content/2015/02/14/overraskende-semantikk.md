---
title: "Overraskende semantikk"
layout: post
link: http://blog.kjempekjekt.com/2015/02/14/overraskende-semantikk/
date: 2015-02-14T08:04:59.330Z
tags:
  - Rebol
  - WTF
---
Mange programmeringsspråk er egentlig ganske like. De har liksom bare litt ulike klær. Vi kaller det *syntaks*. Når man går fra et språk til et annet må man lære de syntaktiske forskjellene, og så kan man programmere.

Men av og til støter man på litt større forskjeller. Ting som ser like ut i språk A og språk B kan plutselig ha ulik betydning. Dette kan vi kalle *semantiske* forskjeller, og de kan ofte være litt mer overraskende. Det tar lengre tid å lære seg semantiske forskjeller, og ikke minst hvordan man *utnytter* et språks semantiske særegenheter.

De siste dagene har jeg jobbet litt med [Rebol](http://blog.kjempekjekt.com/tags/rebol/) igjen. Det er et veldig fasinerende språk. Og det skiller seg fra de mere konvensjonelle språkene på en rekke områder - både i forhold til syntaks og semantikk. I dag fikk jeg lyst å vise en konkret forskjell som overrasket meg, og som gjorde at jeg innførte en feil i koden min som det tok laaaang til å debugge.

La oss begynne i et annet språk. Her har du en funksjon i F# - `prepend123` - som tar i mot en liste med tall og legger på tallene 1, 2 og 3 i starten:

    let prepend123 xs =
        List.append [1; 2; 3] xs  

Hvis jeg nå sier

    prepend123 [4; 5; 6]

får jeg tilbake listen `[1; 2; 3; 4; 5; 6]`. Og jeg kan selvfølgelig gjøre dette mange ganger, med samme resultat.

La oss så forsøke det samme i Rebol.

    prepend123: func [xs] [
        append [1 2 3] xs
    ]

Det er jo syntaktiske forskjeller her, men ganske likt ble det jo likevel. Hvis jeg nå sier:

    prepend123 [4 5 6]

får jeg tilbake listen `[1 2 3 4 5 6]`. Og jeg kan selvfølgelig gjøre dette mange ganger, med samme resultat. Eller? Hva tror du skjer om jeg sier 

    prepend123 [4 5 6]

en gang til?

Til min store overraskelse viste det seg at resultatet nå ble listen `[1 2 3 4 5 6 4 5 6]`! *What?!?*

Det viser seg at Rebol *husker* hva som har skjedd med listen i funksjonen `prepend123`. `[1 2 3]` er ikke en lokal verdi som bare finnes i funksjonen, og som opprettes hver gang funksjonen kalles - nei, i stedet opprettes det én konkret verdi som gjenbrukes. Og når den modifiseres så må du leve med de modifikasjonene.

Det er ikke med en gang helt enkelt å se hvilke konsekvenser dette får. La oss teste litt til: Jeg starter fra scratch, og nå oppretter jeg tre variabler:

    a: prepend123 [4 5 6]   
    b: replace a 2 0
    c: prepend123 [4 5 6]

Hva er verdien av `a`? Hva er verdien av `b`? Og hva er verdien av `c`?

`a`, `b` og `c` peker alle til samme liste - den som ble opprettet første gang funksjonen ble kalt (eller mer sansynlig ble listen opprettet allerede da funksjonen ble deklarert). Endringen i den andre linjen påvirker dermed også fremtidige kall til `prepend123`. Og verdien i a/b/c er nå `[1 0 3 4 5 6 4 5 6]`.

## Hvordan fikser vi dette da?

Om jeg ønsker samme semantikk som i F# - som var det jeg forventet - kan jeg gjøre følgende endring:

    prepend123: func [xs][
        append copy [1 2 3] xs
    ]

Her lager jeg en eksplisitt kopi av listen før jeg bruker den. Da fungerer det! `copy` er noe du ser mye i idiomatisk Rebol-kode, men det er dessverre litt for enkelt å glemme å bruke det. 

Alternativt kunne jeg opprettet funksjonen slik:

    prepend123: func [xs][
        compose [1 2 3 (xs)]
    ]

`compose` og `append` har ulik semantikk; `compose` modifiserer ikke en liste, den tar en liste som argument og bruker den til å generere en ny liste. Derfor vil dette fungere. Men denne ulikheten gjør det ikke akkurat enklere å lære Rebol.

## Enda mer overraskende med strenger

Denne semantiske finurligheten i Rebol er kanskje enda mer overraskende når man jobber med strenger. Se på dette:

    this-is: func [x] [
        append "This is a " x
    ]

    this-is "banana"

returnerer `"This is a banana"`. Men om jeg så sier

    this-is "apple"

får vi det litt spesielle resulatet `"This is a bananaapple"` :) Også her burde jeg brukt `copy` for å sørge for at det opprettes en ny streng hver gang.

## Tullete eller spennende?

Alt dette virker rart - fordi det er anderledes fra det man er vandt til. Men hva skal man med et programmeringsspråk om det oppfører seg akkurat likt som et annet? Det er de semantiske forskjellene som er spennende. Den egenskapen vi har sett på her gjør at du kan løse ting på andre måter i Rebol enn i et språk X.

Men hva disse andre måtene *er*, og hvordan de ser ut, det vet jeg ikke enda. Læring tar tid.
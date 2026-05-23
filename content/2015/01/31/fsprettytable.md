---
title: "FsPrettyTable"
layout: post
link: http://blog.kjempekjekt.com/2015/01/31/fsprettytable/
date: 2015-01-31T22:47:09.823Z
tags:
  - F#
  - Diverse prosjekter
---
Jeg har fortsatt å trene på F#. Og når man først skal kode så er det jo hyggelig å gjøre det i form av open source-prosjekter som kan komme andre til gode. Men hvor får man ideene til det fra?

Denne gangen fant jeg et sånn passe populært bibliotek fra Python-miljøet, og bestemte meg for å lage min egen "kopi" i F#. Prosjektet jeg har basert meg på er [PrettyTable](https://code.google.com/p/prettytable/), utviklet av [Luke Maurits](http://www.luke.maurits.id.au/). Det er rett og slett et bibliotek som lar deg formatere data som ASCII-tabeller. Det hadde masse konfigurasjonsmuligheter, så det var nok av utfordringer å sette tenna i, og gøy ble det også.

Min variant heter **FsPrettyTable**. Prosjektet har [fått sin egen side](http://tormaroe.github.io/FsPrettyTable/), koden er på [github](https://github.com/tormaroe/FsPrettyTable), og versjon 0.1 er nå [publisert på NuGet](https://www.nuget.org/packages/FsPrettyTable/).

Jeg valgte å lage et slags *fluent* API, som fungerer bra i F# hvor du enkelt kan "pipe" output fra et funksjonskall til en annen funksjon. Her er et brukseksempel for å skrive ut en tabell over mine ansettelsesforhold:

    [["Delfi Data AS"; "Februar 1999"; "Mai 1999"]
     ["New Technology Consulting AS"; "Juni 1999"; "September 2002"]
     ["talk2me as"; "Oktober 2002"; "Mai 2005"]
     ["it's learning as"; "Juni 2005"; "Mai 2006"]
     ["CMA Contiki AS"; "Juni 2006"; "Juli 2009"]
     ["PSWinCom AS"; "August 2009"; "Desember 2014"]
     ["Link Mobility Group"; "Januar 2015"; ""]]    
    |> prettyTable
    |> withHeaders ["firma"; "fra"; "til"]
    |> headerStyle Capitalise
    |> horizontalAlignment Right
    |> horizontalAlignmentForColumn "firma" Left
    |> printTable

..som git output:

    +------------------------------+--------------+----------------+
    | Firma                        |          Fra |            Til |
    +------------------------------+--------------+----------------+
    | Delfi Data AS                | Februar 1999 |       Mai 1999 |
    | New Technology Consulting AS |    Juni 1999 | September 2002 |
    | talk2me as                   | Oktober 2002 |       Mai 2005 |
    | it's learning as             |    Juni 2005 |       Mai 2006 |
    | CMA Contiki AS               |    Juni 2006 |      Juli 2009 |
    | PSWinCom AS                  |  August 2009 |  Desember 2014 |
    | Link Mobility Group          |  Januar 2015 |                |
    +------------------------------+--------------+----------------+

Du finner mange flere eksempler og konfigurasjonsmuligheter på [FsPrettyTable sin hjemmeside](http://tormaroe.github.io/FsPrettyTable/).

Kodemessig er dette et større og mer interessant prosjekt enn det [FSharp.Msisdn](http://blog.kjempekjekt.com/2015/01/10/fsharp-msisdn/) var (som jeg snekret sammen for et par uker siden). Blant annet har jeg måttet eksperimentere litt med hvordan det var mest hensiktsmessig å organisere prosjektet i moduler, og hvordan jeg skulle eksponere bibliotekets API.

Denne gangen tok jeg også i bruk [FAKE](http://fsharp.github.io/FAKE/) (F# Make). Og det var en behagelig opplevesle. Fake-skriptet mitt oppdaterer AssemblyInfo med gjeldene versjonsnummer (hentet fra en ReleaseNotes-fil), bygger prosjektet, bygger og kjører testene, og pakker en ny nuget-pakke hver gang det kjøres.

Jeg har som sagt lansert prosjektet i versjon 0.1, og det gjenstår enkelte ting før det er feature-kompatibelt med Python-versjonen. Jeg har også tenkt på noen ytterligere features som er naturlige å støtte i et kodebibliotek som brukes i et funksjonelt programmeringsspråk som F#. Så her kan jeg fortsatt kose meg med koding noen kvelder fremover.

Hvis dette kan være nyttig for noen, *så flott for dem!* Jeg har i alle fall hatt det litt gøy, og lært noe på veien. Hvis du også er litt tom for ideer til hva du skal lage, så anbefaler jeg å finne et populært prosjekt fra et annet språk - som ikke er for stort - og som ikke finnes i det programmeringsmiljøet som du vil kode for enda.
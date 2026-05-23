---
title: "FSharp.Msisdn"
layout: post
link: http://blog.kjempekjekt.com/2015/01/10/fsharp-msisdn/
date: 2015-01-10T22:28:48.263Z
tags:
  - F#
  - SMS
---
Jeg er veldig i F#-modus for tiden. Jeg gjør diverse småprosjekter for å øve meg, for å finne ut hvordan det *faktisk* er å bruke språket på (semi-)orntlig.

Denne helgen fikk jeg lyst til å lage et biblotek som kanskje kunne være nyttig for andre. Siden det har gått mye i SMS og mobilrelaterte ting de siste årene fikk jeg lyst til å lage et biblotek som gjør det lettere å jobbe med internasjonale mobilnumre - såkalte [MSISDN](http://en.wikipedia.org/wiki/MSISDN).

Og det gjorde jeg. Etter én fredagskveld pluss litt pirk lørdags morgen kunne jeg publisere mitt første prosjekt til NuGet: **[FSharp.Msisdn](https://www.nuget.org/packages/FSharp.Msisdn/)**.

<p class="text-center"><img src="http://blog.kjempekjekt.com/uploads/2015/01/FSharp.Msisdn.NuGet.jpg"></p>

For å raskt demonstrere det meste av hva bibloteket tilbyr har jeg kokt sammen følgende eksempel. Her tar jeg en liste med telefonnumre på ulike format, og bruker FSharp.Msisdn til å validere og normalisere numrene. Til slutt grupperer jeg listen på landskode.

````
// Some numbers..
["004790000001"; "+47 90000002"; "46 123 456 789"
 "112355532122"; "+1 (123) 555-32-123"; "800-xxx-123"]

// Wrap strings in the Msisdn type..
|> List.map Msisdn.create

// Remove invalid numbers..
|> List.filter Option.isSome
|> List.map Option.get

// Group by country code..
|> Seq.groupBy Msisdn.countryCode

// Print result..
|> printfn "%A"
````

Og output blir:

````
seq [(("47", "Norway"), seq [Msisdn "4790000001"
                             Msisdn "4790000002"]);
     (("46", "Sweden"), seq [Msisdn "46123456789"]);
     (("1", "North America"), seq [Msisdn "112355532122"
                                   Msisdn "112355532123"])]
````

En kuriositet: Funksjonen `countryCode` er faktisk noe av det villeste jeg har kodet *ever* - en nøstet *match with* (tenk *switch case* i C#) på _over 400 linjer_!

Prosjektet er [tilgjengelig på Github](https://github.com/tormaroe/FSharp.Msisdn/), så ta en titt om du vil. Der finner du også flere detaljer om hva FSharp.Msisdn tilbyr. Har du innspill eller forslag til endringer og utvidelser, så tar jeg gjerne imot både kommentarer, Github issues og pull requests.

Til slutt må jeg bare nevne at det var Scott Wlaschins utmerkede serie om [å designe med typer i F#](http://fsharpforfunandprofit.com/posts/designing-with-types-intro/) som inspirerte meg til å gjøre dette prosjektet. Anbefales!











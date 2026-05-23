---
scratch: true
title: "Kodekamp: Finn dupliserte filer"
layout: post
link: http://blog.kjempekjekt.com/2015/08/16/kodekamp-dupliserte-filer/
date: 2015-08-16T10:07:39.763Z
tags:
  - Konkurranse
  - F#
---

<p style="text-align:center;"><img src="http://blog.kjempekjekt.com/uploads/2015/08/kodekamp2.png"></p>

Trenger du noe å gjøre på? Velkommen til kodekamp nummer 2! Dette er en uhøytidelig og vennskapelig utviklerkonkurranse hvor alle som har lyst til å delta har én uke til å kode opp en løsning og sende den til <a href="mailto:kodekamp@kjempekjekt.com">kodekamp@kjempekjekt.com</a>.

## Problemet: Dupliserte filer

Av ulike grunner hender det ofte at en og samme fil lagres flere steder på harddisken. Det kan være mange grunner til dette. Av og til gjør vi det med vilje, men ofte er det utilsiktet.

Og da oppstår det problemer. For det første bruker vi unødvendig mye diskplass, og for det andre kan filene raskt komme ut av synk. Og hva om vi så bruker feil fil, ikke den vi lagret sist?

Dette må vi rett og slett finne en løsning på :)

## Oppgaven

I denne kodekampen skal du lage et program som tar som innput to verdier: Første argument er et tall som representerer antall bytes. La oss kalle den `arg1`. Andre argument er en folder-sti; absolutt, eller relativt til hvor programmet kjøres fra. La oss kalle den `arg2`.

Programmet skal så traversere nedover folderstrukturen fra `arg2` og finne alle filer det finnes to eller flere av. To filer vurderes å være den samme om innholdet er identisk.

<p style="text-align:center;"><img src="http://blog.kjempekjekt.com/uploads/2015/08/duplicate-file-remover.jpg"></p>

Hvis filstørrelsen er mindre enn `arg1` skal programmet se bort fra den.

Programmet skal liste ut dubletter på en fornuftig måte.

Programmet skal også validere argumentene, og gi en fornuftig feilmelding om det ikke brukes riktig.

Og til slutt: Programmeringsspråket som er valgt denne gang er F#. Oppgaven skal leveres som én .fs-fil som kan kompileres til et konsoll-program med F# 3.1, uten andre avhengigheter. Jeg ønsker altså ikke å motta noe Visual Studio-prosjekt.

PS: Jeg tar ikke her stilling til om du utvikler/kjører på Windows, Mac eller Linux - ingen diskriminering her. Eventuelle OS-ulikheter som har noe å si for å løse oppgaven må du selv vurdere hva du gjør med.

### Hvis du ikke kan FSharp..

... så er dette en fin anledning til å lære! [Her er min introduksjon til F#](http://blog.kjempekjekt.com/2011/12/06/f/), og [her finner du noen lære-ressurser](http://fsharp.org/about/learning.html).


## Vurdering av besvarelen

Som i forrige runde vil besvarelsene vurderes i forhold til korrekthet, lesbarhet og eleganse. Jeg vil spesielt vurdere strategien valgt for å traversere folderstrukturen, strategien for å finne duplikater, og hvordan resultatet presenteres (god brukeropplevelse). Jeg vil også måle og sammenligne hastighet.

Besvarelsen må leveres til <a href="mailto:kodekamp@kjempekjekt.com">kodekamp@kjempekjekt.com</a> senest søndag 23. august 2015. Om du synes det er greit at jeg bruker ditt fulle navn, inkluderer lenke til twitter, hjemmeside eller lignende, så gi meg beskjed om det.

Jeg gleder meg til å se mange, spennende løsninger. For jeg regner nesten med at denne oppgaven vil føre til programmer med større ulikheter enn den første oppgaven. Så lykke til!
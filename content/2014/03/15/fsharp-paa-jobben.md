---
title: "Vi lærer F# på jobben"
layout: post
link: http://blog.kjempekjekt.com/2014/03/15/fsharp-paa-jobben/
date: 2014-03-15T22:39:54.658Z
tags:
  - F#
  - Jobb
  - PSWinCom
---
Siden jeg startet i [PSWinCom](http://pswin.com) har det vært viktig for oss i utviklingsavdelingen å bruke litt av tiden vår på å holde oss oppdaterte, utvide horisonten og lære hverandre nye ting. 

Hver uke setter vi av én time til å gjøre noe helt annet enn det vi normalt holder på med. Vi har sett videoer, holdt presentasjoner for hverandre og hatt små *coding dojo*-sesjoner.

Men det har vært litt vanskelig å passe på at det skjer hver uke. Ofte skipper vi *timen vår* når vi har det hektisk, når ingen har rukket å forberede noe. "Den tekniske timen" blir fort glemt. 

##Fokusere på én ting over lengre tid
For å få mere ut av disse timene bestemte vi oss i år for å gjøre det litt anderledes. Det vi forsøker på nå er å i felleskap velge oss et tema som mange har lyst å lære mer om, og så fokusere på dette over en periode på ca to måneder.

Det første temaet vi valgte var **F#**. I to måneder vil vi som team bruke én time i uken på å lære mer om dette språket, og hva det kan gjøre for oss.

Vi bruker ulike måter å lære på. Jeg holdt en *ultrarask* presentasjon av språket (en komprimert utgave av [den jeg holdt på NNUG i januar](http://www.meetup.com/NNUG-Bergen/events/161554552/)). Den neste timen lagde jeg en oppgave som de andre skulle løse i felleskap. Mellom dette gav jeg litt hjemmelekse - noen små øvingsoppgaver som utviklerne kunne bryne seg på om de ville.

Innholdet den tredje uken var videoen [F# for Parallel and Asynchronous Programming](http://www.microsoftpdc.com/2009/FT20).

Etter dette har det stoppet litt opp pga. endel omstendigheter, men målet nå er at vi over noen uker skal forsøke å bruke F# til å løse et reelt problem som vi allerede vet hvordan vi løser i C#. Dermed vil vi bedre kunne se hvilke fordeler F# kan gi oss, og erfare hvordan komponenter skrevet i F# vil fungere inn i vårt eksisterende produkt.

##Hva er målet?
Det vi ønsker å oppnå ved å fokusere på F# i to måneder er rett og slett å finne ut om språket kan gi oss noe. Hva er F# bra på, og hva er det mindre bra på. Selvsagt kan ikke F# løse noe som C# ikke kan, men F# og funksjonell programmering kan lære teamet å tenke på nye måter, og personlig håper jeg vi vil oppleve at enkelte ting blir mindre komplekse og enklere å implementere.

Målet er at vi skal bli såpass komfortable *at vi tørr* velge F# som implementasjonsspråk når vi skal igang med å løse en ny oppgave - uavhegig om vi velge å gjøre det eller ikke.  

##Men noen er dristigere enn andre
Allerede etter første time om F# var det [én utvikler](https://twitter.com/kjerstibb) som valgte å bruke det nye språket til å implementere noe som skulle i produksjon. Det var utrolig gøy å se! Og hvorfor ikke - den beste måten å lære på er å kaste seg ut i det. Nå når alle på teamet blir eksponert for språket er ikke rissikoen ved å ta dette valget så veldig stor.

Valget førte derimot til at vi måtte gjøre et grep for å støtte F# i TeamCity, noe den ikke gjorde ut av boksen. Men det var ikke så vanskelig å få til etter at [vi fant oppskriften på nettet](http://www.heartysoft.com/ashic/blog/2013/3/build-fsharp-3-on-build-server-without-vs) (et greit tips for dem som trenger det).

##Retrospective
Når de to månedene er over vil vi gjøre en retrospective og reflektere over hva som fungerte og hva som ikke fungerte så bra - i forhold til F#, men også i forhold til hvordan vi tilnærmet oss utfordringen. Etterhvert håper jeg vi som team blir gode på å sette oss grundig inn i nye ting og teknologier.

Hva synes du om valget vårt? Bruker du F# i jobben? Hva gjør dere på din arbeidsplass for å motivere hverandre til å lære? Som vanlig setter jeg veldig stor pris på kommentarer!
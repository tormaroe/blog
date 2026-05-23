---
title: "Allsidige Redis"
layout: post
link: http://blog.kjempekjekt.com/2016/05/30/redis/
date: 2016-05-30T19:06:47.107Z
tags:
  - Databaser
  - MSMQ
  - Software/verktøy
---

**[Redis](http://redis.io/)** er en spennende dataserver jeg ble for alvor interessert i da jeg leste *[Seven Databases in Seven Weeks](https://pragprog.com/book/rwdata/seven-databases-in-seven-weeks)* for noen år siden. Denne bloggposten handler om hvordan vi har tatt i bruk Redis i prosjektet jeg jobber på i LINK Mobility - hva Redis er godt for rett og slett!

Redis er i bunn og grunn en *in-memory key-value store*. Den er lynrask, støtter ulike cluster-oppsett, og [valgfri datapersistering](http://redis.io/topics/persistence). Men så har den i tillegg en rekke egenskaper som gjør Redis helt unik (såvidt jeg kjenner til).

Redis (som står for *REmote DIctionary Server*) tilbyr nemlig datastrukturer: Den har lister, mengder, sorterte mengder, hashtabeller, bitmaps, geospatiale indekser og mere til, samt de vanlige operasjonene man kan forvente på disse. Den støtter atomiske transaksjoner, publish/subscribe, bruker [Lua](http://blog.kjempekjekt.com/2011/12/01/lua/) som skriptspråk, og har et elegant og simplistisk API.

En mulig bekymring er at Redis i hovedsak vedlikeholdes og utvikles av én person: [Salvatore Sanfilippo](https://twitter.com/antirez) a.k.a. antirez. Men selskapet [Redis Labs](https://redislabs.com/) sponser utviklingen, og når giganter som Twitter, GitHub, Pinterest, Snapchat, Craigslist, StackOverflow og Flickr bruker Redis så er det ingen fare for at teknologien dør med det første.

![Redis logo](http://blog.kjempekjekt.com/uploads/2016/05/redis.png)

Med alle datastrukturene er Redis som en *sveitsisk lommekniv*, og dette er grunnen til at vi har løst hele *seks* helt ulike problemer med den i vårt prosjekt. La meg gå gjennom dem en etter en...

## 1. Cache

Det begynte med at jeg trengte en løsning for a cache en rekke rapporter. For caching finnes det mange muligheter, men jeg så på dette som en fin anledning til å få inn Redis i stacken vår.

Det jeg cacher er json-grunnlaget for noen webrapporter, samt noen CSV-filer. TIl dette bruker jeg key-value funksjonaliteten i Redis med en *time-to-live* som lar meg bestemme hvor lenge cachen skal være gyldig. I mitt tilfelle er det snakk om flere dager. Etter dette sier det "poff" og dataene er borte.

## 2. Distribuert låsing

I løsningen vår har vi en *web server farm* som eksponerer et API. Når vi behandler en innkommende request må vi forsikre oss om at ingen andre servere får den nøyaktig samme requesten og forsøker å behandle denne. Til dette implementerte vi en låsemekanisme, og til å begynne med brukte vi MongoDB til å registrere låsene.

Men da vi hadde innført Redis i stacken var det naturlig å gjøre registreringen der. For det første er Redis raskere. For det andre har Redis et *single threaded* design som gjør det umulig for to prosesser å registrere den samme låsen. Og for det tredje kunne vi også her benytte *time-to-live* til å automatisk oppheve låser som av en eller annen grunn ikke ble avregistrert.

Du kan lese mer om [distribuert låsing med Redis her](http://redis.io/topics/distlock).

## 3. Pub/Sub

Som sagt kjører vi en web farm med flere servere. Under arbeidet med en ny integrasjon nå i år dukket det opp en problemstilling hvor vi fikk inn en request som måtte behandles av én bestemt server.., som ventet på denne requesten. Utfordringen var at vi i mottaket av requesten ikke kunne vite hvilken server det var som ventet.

For å løse dette valgte vi å bruke Redis igjen. Når en server venter på en av disse requestene begynner den å lytte til en pub/sub-kanal i Redis. Og når requesten kommer inn publiserer mottakeren dette til samme kanal, slik at serveren som skal behandle den får vite det og kan plukke den opp.

Dette var den til dags dato mest kompliserte enkeltintegrasjonen i løsningen vår, men med Redis ble det egentlig ganske enkelt likevel. Jeg planlegger å beskrive dette nærmere i en egen bloggpost.

## 4. KPI-beregning og monitorering

I løsningen vår er det mye som må overvåkes, og nå når vi var så godt i gang valgte vi å bruke Redis til deler av dette også. Vi har en prosess som mottar samtlige request systemet har behandlet, og som aggregerer (teller antall) gruppert på requesttype, resultatkode og tidspunkt. 

Hvert minutt opprettes det en ny *hash* i Redis, og prosessen inkrementerer tellere i denne hashen. 60 minutter senere slettes dataene automatisk (*time-to-live* igjen). I mellomtiden danner dataene grunnlag for grafer og andre indikatorer i et dashboard som forteller oss hvordan systemet har det.

## 5. Live request stream

For å virkelig få en god forståelse av hvordan systemet vårt oppfører seg gikk vi ett skritt lengre; vi *streamet* detaljer om alle de prosesserte requestene direkte til dashboardet, sånn at vi kunne se dem fare over skjermen. 

Til dette brukte vi igjen Redis sin pub/sub funksjonalitet. Alle requestene ble publisert på en Redis-kanal. I dashboard-løsningens backend (en [Nancy-applikasjon](http://nancyfx.org/)) lyttet vi på denne kanalen og sendte requestene videre til klientene via [SignalR](http://signalr.net/) (web socket).

Dette fungerte utrolig bra. Jeg skulle ønske jeg kunne vise det frem, men du får nøye deg med å forestille deg hvordan det ser ut ;)

## 6. Meldingskø

I denne løsningen som jeg snakker om hele tiden har vi en avhengighet til Microsofts meldingskø: MSMQ. Slik vi benytter den er den et *[single point of failure](https://en.wikipedia.org/wiki/Single_point_of_failure)*, og det fungerer ikke for oss lengre.

Vi kunne valgt å oppgradere til å bruke en clustret MSMQ-løsning, eller vi kunne tatt i bruk naturlige alternativer som for eksempel [RabbitMQ](https://www.rabbitmq.com/). Men siden vi allerede hadde tilgang til et Redis-cluster så utforsket vi hvilke muligheter det gav oss.

Redis har ikke i utgangspunktet støtte for *reliable message queueing*, men vi fant flere eksempler på at folk før oss med noen enkle grep har implementert dette på toppen av Redis. Og nå har vi gjort det også!

I skrivende stund kjører vi fortsatt MSMQ i produksjon, men tester ut Redis-løsningen, som ser ut til å fungere bra. Jeg håper jeg kan poste en egen artikkel om dette om ikke så lenge.

## Konklusjon

Redis ble innført i systemet vårt som en enkel cache-server, men når den først var der dukket det opp flere og flere utfordringer hvor Redis var den naturlig løsningen. Erfaringene våre er gode, og databasen (eller *datastruktur-serveren* som man kanskje heller burde kalle den) har et unikt sett med byggeklosser som gjør at jeg vil anbefale den til alle som utvikler distribuerte systemer.


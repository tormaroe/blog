---
title: "beanstalkd-klient for Nim"
layout: post
link: http://blog.kjempekjekt.com/2015/04/12/beanstalkd-klient-for-nim/
date: 2015-04-12T21:10:56.794Z
tags:
  - Nimrod
  - Diverse prosjekter
---
<p class="text-center"> ![beanstalkd.nim logo](http://blog.kjempekjekt.com/uploads/2015/04/beanstalkd.nim.png) </p>

**[beanstalkd](http://kr.github.io/beanstalkd/)** er en enkel og meget rask *open source* kø-server, laget av [Keith Rarick](https://github.com/kr) og inspirert av memcached. Det er ikke en omfattende meldingsformidler (*message broker*) som for eksempel RabbitMQ, men et køsystem med egenskaper som gjør den skreddersydd for meldingsbasert arbeidsdistribusjon.

beanstalkd har blant annet et finkornet prioritetssystem, og når man henter ut en melding (eller en jobb, som nok er den preferete terminologien) så har man X antall sekunder på seg til å løse jobben før man sletter den fra køen. Rekker man ikke dette innen fristen kan man be om mer tid - hvis ikke vil jobben kunne bli gitt til en annen arbeider. Når man putter en jobb inn i en kø kan man også spesifisere et antall sekunder som må løpe før noen kan hente ut jobben.

<p class="text-center"> ![beanstalkd flow](http://blog.kjempekjekt.com/uploads/2015/04/beanstalkd-flow.png) </p>

## Et prosjekt på en helg

I helgen har jeg kodet et klientbibliotek for beanstalkd i programmeringspråket [Nim](http://blog.kjempekjekt.com/tags/nimrod/) (tidl. *Nimrod*) - et språk som fasinerer meg. Jeg har kost meg skikkelig, lært en hel del, laget logo, og fått biblioteket godkjent og tilgjengelig via nim's *package manager* nimble. Prosjektet [finner du på Github](https://github.com/tormaroe/beanstalkd.nim).

Her ser du hvordan git committene fordelte seg utover lørdagen og søndagen:

<p class="text-center"> ![beanstalkd.nim punch card](http://blog.kjempekjekt.com/uploads/2015/04/punch_card.png) </p>

Dette skal ikke være en full gjennomgang av hverken beanstalkd eller prosjektet mitt, men jeg vil trekke frem et par ting...

## Vagrant

Jeg har brukt vagrant til å provisjonere et utviklingsmiljø for prosjektet (jeg nevte vagrant i posten [10 verktøy jeg ikke hadde brukt for et år siden](http://blog.kjempekjekt.com/2015/02/08/10-verktoy/)). Vagrant-filen min kjører opp en Ubuntu og installerer beanstalkd og nim samt et par andre ting jeg bruker. Ekstremt behagelig å jobbe på den måten!

I prosjektet har jeg inkludert endel eksempler på hvordan man kan bruke modulen min. Og om du også har vagrant så er det ekstremt enkelt for deg å bare laste ned repositoriet fra github, fyre opp VM'en, og så kan du kompilere og kjøre eksemplene med én enkelt kommando. Vagrant blir på den måten den eneste avhengigheten prosjektet har.

## Spawn

Dette prosjektet var forresten første gang jeg har forsøkt meg på samtidighetsprogrammering (tråder og sånt) i Nim. Ikke i selve biblioteket, men i ett av eksemplene. Hvis du skummer gjennom koden nedenfor så ser du en distribuert løsning på Euler1-problemet (summen av alle multipler av 3 og 5 under 1000). Jeg bruker beanstalkd og `spawn`.

Først *spawner* jeg en tråd som putter alle tallene inn i kø **A**. Deretter spawner jeg fire tråder som plukker tall fra **A**, vurderer om de er multipler av 3 eller 5, og putter disse inn på en ny kø: **B**. Til slutt har jeg en tråd som samler opp og summerer tallene i **B**.

En lite effektiv måte å summere tall på, men en effektiv strategi for mange andre ting.

```
import beanstalkd, strutils, threadpool

proc produceNumbers() =
  let client = beanstalkd.open("127.0.0.1")
  discard client.use "A"
  for n in 1.. < 1000:
    discard client.put($n)

proc consumeA(id: int) =
  let client = beanstalkd.open("127.0.0.1")
  discard client.watch "A"
  discard client.ignore "default"
  discard client.use "B"
  while true:
    let next = client.reserve(timeout = 1)
    if next.success:
      let n = next.job.parseInt
      if (n mod 3 == 0) or (n mod 5 == 0):
        discard client.put(next.job)
        discard client.delete(next.id)
    else:
      break

proc consumeB() : int =
  let client = beanstalkd.open("127.0.0.1")
  discard client.watch "B"
  discard client.ignore "default"
  var sum = 0
  while true:
    let next = client.reserve(timeout = 1)
    if next.success:
      sum += next.job.parseInt
      discard client.delete(next.id)
    else:
      break
  result = sum

spawn produceNumbers()
for i in 1 .. 4:
  spawn consumeA(i)
let sum = spawn consumeB()
echo "The sum of all multiples of 3 and 5 is " & $(^sum)
```

Enkelt, distribuert, fleksibelt, og tråd-sikkert!

## Dokumentasjon

Jeg har også lagt litt vekt på dokumentasjon denne gangen. Nim-kompilatoren kommer med muligheter for å generere fin dokumentasjon basert på kommentarer i koden. Ta en titt på [tormaroe.github.io/beanstalkd.nim](http://tormaroe.github.io/beanstalkd.nim/).

## Nimble

Nimble er *package manageren* nim-utviklere bruker. For å installere biblioteket mitt kjører man bare..

    nimble install beanstalkd

.. og så er det bare å kode i vei. Får å få dette til måtte jeg klone git-repoen [nim-lang/packages](https://github.com/nim-lang/packages), legge til litt metadata om prosjektet i en JSON-fil, og lage en *pull request*. Den ble akseptert (manuelt av en utvikler altså) etter et par timer, og dermed var beanstalkd.nim tilgjengelig for verden.

Denne løsningen skalerer kanskje ikke spesielt bra når nim blir dødspopulært, men foreløpig er det akkurat løsningen vi trenger.

Når noen installerer biblioteket mitt vil nimble gå til git-repoen min. Der vil den finne den siste committen jeg har tagget med et versjonsnummer (eller en commit med et ønsket versjonsnummer), og laste den ned på utviklerens maskin. Og det er alt - ingen kompilering nødvendig. Når utvikleren så kompilerer sitt eget prosjekt vil mit bibliotek linkes statisk inn og kompileres som en del av løsningen.

Det finnes også en offisiell liste over klientbiblioteker til beanstalkd for ulike programmeringsspråk - [i form av en github wiki](https://github.com/kr/beanstalkd/wiki/Client-Libraries). Og det er jo superpraktisk, for da kunne jeg legge inn prosjektet mitt selv :)

## Oppsummering

Punkt 1: Jeg har hatt det gøy, og lært mye mer om Nim!

Punkt 2: I løpet av en helg (og jeg har gjort mye annet i helgen også altså) kan man gjøre og dele et prosjekt som kan vise seg å være nyttig for folk. Jeg håper det i alle fall.

Punkt 3: Jeg har ikke brukt beanstalkd til noe reelt enda, men jeg har i alle fall gode erfaringer sålangt og tro på produktet. Det har eksistert siden 2007, selv om jeg hørte om det første gang for bare noen uker siden. Jeg håper flere vil ta en titt.

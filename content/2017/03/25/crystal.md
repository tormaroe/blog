---
title: "Crystal: Hurtig som C, glatt som Ruby"
layout: post
link: http://blog.kjempekjekt.com/2017/03/25/crystal/
date: 2017-03-25T14:12:39.607Z
tags:
  - Polyglot
---

Etter å ha lekt meg en kveld med APL ([se forrige bloggpost](http://blog.kjempekjekt.com/2017/03/24/apl/)) er det på tide å se på noe med litt mere potensiale for fremtiden. **[Crystal](https://crystal-lang.org/)** er et nytt programmeringsspråk inspirert av Ruby, men det bruker LLVM til å kompilere til maksinkode, så man kan oppnå ytelse sammenlignbar med C.

<p style="text-align:center;"><img src="http://blog.kjempekjekt.com/uploads/2017/03/crystal_logo.svg" width="500"></p>

Jeg nevnte språket første gang for to år siden i posten [10 språk som kompilerer til native](http://blog.kjempekjekt.com/2015/04/01/10-som-kompilerer-til-native/), men denne gangen har jeg tatt en litt grundigere titt.

Crystal er statisk typet, men bruker typeinferens slik at man ikke trenger å eksplisitt strø om seg med typedeklarasjoner. Kompilatoren luker også bort potensielle `null`-referanser, har kraftige makroer, og en kanalbasert concurrency-modell inspirert av Go (også kalt [Communicating sequential processes](https://en.wikipedia.org/wiki/Communicating_sequential_processes), først beskrevet av Tony Hoare i 1977).

Det er mye å like her altså. Crystal er som en smeltedigel av gode ideer, med en velprøvd og velkjent innpakning.

Og som alltid - det første jeg forsøkte å gjøre i Crystal var å finne summen av alle tall under 1000 som er multipler av 3 eller 5. Det var ikke vanskelig:

```
puts (1...1000).select {|x| x % 3 == 0 || x % 5 == 0 }.sum
```

Om du er kjent med Ruby så ser du at dette er 100% gyldig Ruby-kode, som gjør det veldig lett for meg å komme i gang med Crystal.

Kompilatoren kommer med verktøy for å generere en prosjektstruktur fra scratch, inkludert make-lignende tasks, opplegg for enhentstester med mere. [crystal-lang.org/docs](https://crystal-lang.org/docs/) gir en fin introduksjon for nybegynnere, mens [crystal-lang.org/api](https://crystal-lang.org/api) dokumenterer standardbilioteket.

Du kan også teste Crystal online på [play.crystal-lang.org](https://play.crystal-lang.org).

Det er fortsatt "early days" for Crystal. Språket er i *alpha*, men det jeg har sett sålangt virker solid. Jeg får inntrykk av at det er god driv i prosjektet, og programmeringsmiljøet på Reddit og andre steder viser mye interesse. Bare siste uken har 7 utviklere pushet 16 commits, 6 nye pull requests har blitt åpnet, mens 9 pull requests har blitt inkorporert i master. 16 issues har blitt lukket og 12 nye åpnet. Prosjektet har [7720 stjerner på GitHub](https://github.com/crystal-lang/crystal).

Så nå må jeg bare finne et eller annet prosjekt hvor jeg kan få testet ut Crystal på orntlig.
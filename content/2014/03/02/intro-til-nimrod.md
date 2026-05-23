---
title: "Introduksjon til Nimrod"
layout: post
link: http://blog.kjempekjekt.com/2014/03/02/intro-til-nimrod/
date: 2014-03-02T09:38:52.711Z
tags:
  - Nimrod
---
Denne artikkelen handler om programmeringsspråket Nimrod - et overraskende spennende språk jeg kom over for noen uker siden.

Jeg har lenge hatt lyst til å lære meg et såkalt _systemutviklingsspråk_. Jeg snakker om språk hvor man er "tettere på" datamaskinen. Den åpenbare kandidaten er [C](/tags/c), men jeg klarer liksom aldri å komme orntlig i gang med det.

Derfor har jeg den siste tiden gått og vurdert alternativene. Ett av dem er [D](/tags/d) (tar egentlig opp kampen med C++), og så har vi nykommerne *Rust* og *Go*. Go skal være lite, pragmatisk og enkelt å komme i gang med. Rust er mye større, og tar et lengre steg bort fra C-arven. De er altså veldig forskjellige, og jeg er veldig usikker på hva jeg skal gjøre... 

## Et språk som kompilerer til C

Og så kommer jeg plutselig over *Nimrod* ([nimrod-lang.com](http://nimrod-lang.org/)). Du behøver ikke å være overrasket over at du ikke har hørt om det før, for det er det ikke mange som har. Men til å være så lite og "betydningsløst" overrasket det meg på flere områder.

Nimrod er et *statisk* typet *imperativt* språk. Målet med språket er at det skal gi utvikleren alle muligheter til å uttrykke seg på en god og elegant måte, men uten å inngå noe kompromi i forhold til kjøretids.

Kompilatoren produserer kompakt og effektiv C-kode (eller C++ eller Objective-C om man ønsker det). Språket har makroer, type inference, generics, og en rekke spennende features - inkludert et overraskende rikt standardbiblotek (gitt at det er så lite kjent).

![Nimrod logo](/uploads/2014/03/nimrod.png)

## En blanding av Python og Pascal
Oppfinneren sier språket er inspirert av Python og Pascal, men personlig synes jeg det har vel så mange likhetstrekk med F# / ML. Syntaksen er grei å komme i gang med.

Som vanlig når jeg tester ut et nytt språk begynner jeg med å løse oppgaven jeg kaller Euler1: _Finn summen av alle tall under 1000 som er multipler av 3 eller 5_.

Her er min første løsning. Først oppretter jeg en prosedyre som er en infix-operator for å sjekke om et tall er en multippel av et annet. Dette minner om hva du kan gjøre i F#, og er noe jeg kun gjorde for å være fancy :)

```ruby
# A "is multiple of" operator 
proc `%=` (x, d: int): bool =
  x mod d == 0
```

Deretter implementerer jeg prosedyren som kjører en for-løkke over alle tallene og summerer opp:


```ruby
# sum of all numbers below x
# that is a multiple of 3 or 5
proc euler1(x: int): int =
  result = 0
  for i in 1.. < x:
    if (i %= 3) or (i %= 5):
      result += i
```

Legg merke til at vi har _type inference_ lokalt i prosedyren, men at vi må spesifisere typer i selve signaturen. `result` er en magisk variabel alle prosedyrer har, og med mindre man returnerer noe annet så er den den som returneres til slutt.

For å beregne og skrive ut svaret kan jeg nå skrive:

```ruby
echo "Svaret er ", euler1(1000)
```

### Nimrod har iteratorer
I neste løsning lager jeg en iterator som produserer alle tallene som er multipler av 3 eller 5. Dette er noe man finner i flere språk. I F# bruker man for eksempel _sequence expressions_, og i C# kan man lage en metode som returnerer en `IEnumerable` og bruke `yield return` for å returnere ett og ett element av gangen. Et annet navn som ofte betyr det samme er _generators_.

```ruby
iterator eulerUpto(n: int): int =
  var i = 0
  while i <= n:
    if (i %= 3) or (i %= 5):
      yield i
    inc i
```

Nå kan jeg lage en loop som konsumerer iteratoren, og summere opp tallene på denne måten:

```ruby
var result = 0
for i in eulerUpto(999):
  result += i

echo "Svaret er ", result
```

### En funksjonell løsning med sekvenser
Jeg foretrekker funksjonelle løsninger, og Nimrod støtter dette også:

```ruby
import sequtils

let
  eulerSeq = toSeq(eulerUpto(999))
  sum = foldl(eulerSeq, a + b)

"Svaret er ".echo sum
```

En liten detalj å legge merke til som jeg synes er spennende: I det siste eksempelet bruker jeg `echo` på en ny måte - som om det var en metode på et streng-objekt. Men det er akkurat den samme prosedyren. Slik jeg forstår det bruker Nimrod dot-operatoren til å sende verdien på venstresiden som første argument til prosedyren som kalles. Dette gjør at man står friere i forhold til hvordan man strukturerer koden, og man kan kjede sammen prosedyrekall på en enkel måte.

For ordens skyld - Nimrod har en `sum`-prosedyre også. Den finner vi i math-modulen:

```ruby
import math
let sum2 = eulerSeq.sum
"Svaret er ".echo sum2
```

## Les mer
Det kommer flere poster om Nimrod på Programmeringsbloggen, men mens du venter kan du ta en titt på følgende:

* Video/foredrag: [Nimrod: A New Approach to Metaprogramming](http://www.infoq.com/presentations/nimrod) (jeg tror det er fra StrangeLoop 2013)
* Dr.Dobb's: [Nimrod: A New Systems Programming Language](http://www.drdobbs.com/open-source/nimrod-a-new-systems-programming-languag/240165321)
* Lambda the Ultimate: [Nimrod: A new statically typed, compiled programming language which supports metaprogramming](http://lambda-the-ultimate.org/node/4749) 
* Og selvsagt [nimrod-lang.org](http://nimrod-lang.org/)
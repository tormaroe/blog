---
title: "Stack-basert kalkulator-kata i Nimrod"
layout: post
link: http://blog.kjempekjekt.com/2014/03/06/stackbasert-kalkulatorkata-i-nimrod/
date: 2014-03-06T22:13:35.721Z
tags:
  - Nimrod
  - Kata
---
Jeg har [introdusert Nimrod](http://blog.kjempekjekt.com/2014/03/02/intro-til-nimrod/) og jeg har vist hvordan man kan [implementere et lite program i språket som sender en SMS](http://blog.kjempekjekt.com/2014/03/04/sende-sms-med-nimrod/). Nå vil jeg implementere et litt større program som jeg også har gjort i mange språk før: nemlig en stack-basert kalkulator. Gjennom dette vil jeg introdusere deg for en rekke nye egenskaper fra Nimrod.

En stack-basert kalkulator er interessant blant annet fordi det danner grunnlaget for hvordan mye innenfor datamaskiner og programmering fungerer _under the hood_. Hvis du ikke forstår hva en slik kalkulator er for noe eller hvordan den brukes så vil du nok lære det underveis i bloggposten.

Så la oss begynne..

## Tuples
Vi trenger å holde track på noe data, og jeg vil samle det i et eller annet form for objekt. Nimrod har fin støtte for sterkt typede _tuples_, og det passer meg fint. Jeg definerer typen `TState` som skal holde på kalkulatorens tilstand.

```python
import strutils

type
  TState = tuple
    running: bool
    input: string
    stack: seq[int]
```

`TState` har tre verdier:

* `running`: En boolsk variabel som sier om kalkulatoren fortsatt kjører (settes til `false` når bruker ønsker å avslutte)
* `input`: Brukerinput fra konsollet
* `stack`: En sekvens av heltall som representerer datastacken til kalkulatoren

Jeg kan nå opprette en global variabel av type `TState` med kalkulatorens starttilstand.

```python
var
  state: TState = ( running: true,
                    input: "",
                    stack: @[0] )
```

Legg merke til at jeg initialiserer datastacken med tallet 0. Det er praktisk å gjøre dette fordi jeg da kan unngå å håndtere situasjonen hvor stacken er helt tom.

Normalt forsøker jeg gjerne å unngå global state, men i dag gjør vi det enkelt.

## Input fra bruker
La oss så definere en prosedyre som skriver ut et prompt og leser inn innput fra brukeren. Input lagres i `state` tupelen.

```python
proc read() =
  stdout.write "~> "
  state.input = stdin.readLine
```

## En høyere ordens prosedyre
Kalkulatoren skal kunne gjøre operasjonen på stacken. Operasjonene jeg vil støtte er `+`, `-` og `*`. Jeg dropper deling for å unngå å forholde meg til flyttall - denne kalkulatoren opererer kun på heltall.

Når man sier at kalkulatoren skal gjøre en operasjon så skal den gjøre på de to øverste elementene i stacken. Disse to elementene poppes av (altså fjernes), og resultatet pushes tilbake på stacken.

Vi kan lage en prosedyre som tar en operasjon (i form av en annen prosedyre) som argument, og utfører denne. Dette kan se slik ut:

```python
proc doStackOp (op: proc (a, b: int): int) =
  let 
    a = state.stack.pop
    b = state.stack.pop
  state.stack.add op(a, b)
```

Parameterdeklarasjonen er det mest avanserte her. `op: proc (a, b: int): int` betyr altså at parameter ved navn `op` skal være en prosedyre (`proc`) som tar inn to heltall (`a, b: int`) og returnerer et heltall (`: int`).

Men hva om stacken bare har ett element? Da skal vi late som om elementet ligger to ganger på stacken. Inneholder stacken for eksempel kun tallet `10`, og vi utfører operasjon `+`, så skal stacken etterpå inneholde tallet `20`. For å få til det må vi endre hvordan vi popper variabel `b`:

```python
proc doStackOp (op: proc (a, b: int): int) =
  let 
    a = state.stack.pop
    b = if state.stack.len == 0: a
        else: state.stack.pop
  state.stack.add op(a, b)
```

## Unntakshåndtering og switch/case
Nå når vi har `doStackOp` kan vi lage en prosedyre som evaluerer input som vi har fått fra brukeren. Først forsøker vi å gjøre om input til et heltall ved å bruke `ParseInt`. Hvis det går bra legger vi bare tallet på stacken.

Hvis det ikke går bra vil det bli kastet et `EInvalidValue` exception. Dette kan vi fange opp og så undersøke hva input er med Nimrods `case .. of` struktur. Jeg definerer cases for regneoperasjonene, samt en case for input `q` som skal avslutte kalkulatoren. All annen input forkaster jeg ved hjelp av en tom _else_.

Hele prosedyren ser slik ut:

```python
proc eval() =
  try:
    let n = state.input.ParseInt
    state.stack.add n
  except EInvalidValue:
    case state.input
    of "q": state.running = false
    of "+": doStackOp proc (a, b: int): int = a + b
    of "-": doStackOp proc (a, b: int): int = a - b
    of "*": doStackOp proc (a, b: int): int = a * b
    else:
      # bad input, but we don't care..
```

## Templates
Prosedyren `eval` som vi nettopp lagde fungerer greit den, men det var litt tungvidt å skrive kallene til `doStackOp`. Det føltes liksom som om jeg måtte repetere meg selv så mye. La oss se hva vi kan gjøre med det..

Nimrod har ulike former for makroer. Den enkleste varianten kalles _templates_. Jeg kan lage en template som hjelper meg å skrive enklere syntaks for kall til `doStackOp`. Denne templaten ser ut som en prosedyre, men den tolkes under kompileringen av programmet, og kallet til template-prosedyren erstattes av innholdet i templaten før programmet er ferdig kompilert.

```python
template stackOp (ex: expr): expr =
  doStackOp proc (a, b: int): int = ex
```

Legg merke til at parameter `ex` har type `expr` - som står for expression. Legg også merke til at linje to er veldig lik det som gjøres i hvert case i `eval`. Nå kan vi nemlig skrive `eval` på nytt litt enklere:

```python
proc eval() =
  try:
    let n = state.input.ParseInt
    state.stack.add n
  except EInvalidValue:
    case state.input
    of "q": state.running = false
    of "+": stackOp a + b
    of "-": stackOp a - b
    of "*": stackOp a * b
    else:
      # bad input, but we don't care..
```

Kult? Det synes i alle fall jeg :)

## Dollartegn-operatoren
Nimrod bruker `$` som en standard operator for å gjøre en hvilken som helst verdi om til en streng. Dette er altså som for eksempel `Object.ToString()` i .NET. Nå vil jeg lage en slik operator for stacken, slik at jeg kan skrive den ut mellom hver gang brukeren gjør noe.

```python
proc `$` (s: seq[int]): string =
  result = "["
  for x in s:
    result.addSep(startLen=len("["))
    result.add($x)
  result.add "]"
```

En streng i Nimrod har (via strutils-modulen) metoder som gjør den om til noe som minner mer om en slags `StringBuilder`. Her bruker jeg for eksempel `addSep`. Fra [dokumentasjonen](http://nimrod-lang.org/strutils.html):

> proc addSep(dest: var string; sep = ", "; startLen = 0)
> ...
> This is often useful for generating some code where the items need to be separated by sep. sep is only added if dest is longer than startLen.

## Print
Neste prosedyre bruker `$` som vi akkurat lagde til å skrive ut stacken:

```python
proc print() =
  state.stack.`$`.echo
```

Vi kunne har skrevet `echo($(state.stack))`, men _proc chaining_ er mere interessant og enklere å lese.

## REPL
Vi nærmer oss slutten. Vi har nå blant annet laget prosedyrene `read`, `eval` og `print`. Det er 3/4 av det vi kaller en *REPL*, som står for _Read Eval Print Loop_. Dette er en kraftig abstraksjon som kan brukes til å designe de fleste, interaktive konsollprogram.

Og her er delen som mangler:

```python
proc loop() =
  read(); eval(); print()
  if state.running: loop()
```

Dette er altså en rekursiv prosedyre som leser input, evaluerer input, skriver ut tilstanden, og så gjør alt sammen en gang til - hvis ikke det er på tide å stoppe.

De eneste som gjenstår nå er å kalle `loop`..

```python
loop()
echo "Bye bye"
```

...og si _bye bye_ når loopen er ferdig.

## Kompilering og kjøreeksempel
For ordens skyld tar jeg med hvordan det ser ut når jeg til slutt kompilerer calc.nim:

```
PS C:\dev\nimrod-test> nimrod.exe compile .\calc.nim
c:\program files (x86)\nimrod\config\nimrod.cfg(36, 11) Hint: added path: 'C:\Users\tormar\.babel\libs\' [Path]
Hint: used config file 'C:\Program Files (x86)\Nimrod\config\nimrod.cfg' [Conf]
Hint: system [Processing]
Hint: calc [Processing]
Hint: strutils [Processing]
Hint: parseutils [Processing]
gcc.exe -c -w "-IC:\Program Files (x86)\Nimrod\lib" -o c:\dev\nimrod-test\nimcache\calc.o c:\dev\nimrod-test\nimcache\calc.c
gcc.exe -c -w "-IC:\Program Files (x86)\Nimrod\lib" -o c:\dev\nimrod-test\nimcache\system.o c:\dev\nimrod-test\nimcache\system.c
gcc.exe -c -w "-IC:\Program Files (x86)\Nimrod\lib" -o c:\dev\nimrod-test\nimcache\strutils.o c:\dev\nimrod-test\nimcache\strutils.c
gcc.exe -c -w "-IC:\Program Files (x86)\Nimrod\lib" -o c:\dev\nimrod-test\nimcache\parseutils.o c:\dev\nimrod-test\nimcache\parseutils.c
gcc.exe   -o c:\dev\nimrod-test\calc.exe  c:\dev\nimrod-test\nimcache\parseutils.o c:\dev\nimrod-test\nimcache\strutils.o c:\dev\nimrod-test\nimcache\system.o c:\dev\nimrod-test\nimcache\calc.o
Hint: operation successful (9347 lines compiled; 5.370 sec total; 10.102MB) [SuccessX]
```

Og bruker kalkulatoren:

```
PS C:\dev\nimrod-test> .\calc2.exe
~> 2
[0, 2]
~> 234
[0, 2, 234]
~> bad input
[0, 2, 234]
~> +
[0, 236]
~> -
[236]
~> *
[55696]
~> 3
[55696, 3]
~> -
[-55693]
~> q
[-55693]
Bye bye
```

## Konklusjon
Jeg har akkurat gjort denne kataen i F# også, og jeg synes Nimrod-løsningen ble like enkel og nesten like elegant som den. Det viktigste jeg lærte meg var hvordan _tuples_ fungerer i Nimrod, og hvordan jeg kan lage _template-makroer_.

Det neste jeg bør gjøre er å sette meg inn i hvordan Nimrods andre makroer fungerer. Kanskje det er på tide at jeg ser [Nimrod: A New Approach to Metaprogramming](http://www.infoq.com/presentations/nimrod)?!
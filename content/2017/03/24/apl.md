---
title: "A Programming Language"
layout: post
link: http://blog.kjempekjekt.com/2017/03/24/apl/
date: 2017-03-24T18:48:15.987Z
tags:
  - Polyglot
  - Esoteriske språk
---

**[APL](https://en.wikipedia.org/wiki/APL_%28programming_language%29)** er et programmeringsspråk *(pun intended!)* utviklet tidlig på 60-tallet. Det er matematisk av natur, og har hatt sterk inflytelse på mange av verktøyene vi bruker for å analysere tall og sånt i dag - f.eks. regneark, programmeringsspråk som MATLAB, og funksjonell programming som konsept. 

<p style="text-align:center;">![Kenneth Iverson](http://blog.kjempekjekt.com/uploads/2017/03/apl.png)</p>

Jeg har forsøkt ganske mange programmingsspråk, men APL har jeg ikke prøvd før. Grunnen er kanskje at det virker litt skummelt. Det har nemlig en sær og kompakt syntaks basert på tegn det ikke lenger er vanlig å se i kildekode. Men nå er det på tide å ta APL ut på en liten kjøretur!

## Summen av alle tall...

Som vanlig vil jeg som et første eksperiment løse den oppgaven jeg har løst så mange ganger før: *Finne summen av alle multimpler av 3 eller 5 under 1000.* La oss steg for steg bygge opp en løsning...

I APL jobber vi typisk med arrays, og det første jeg trenger å gjøre er å lage et array av alle tall fra 1 til 999.

```
⍳999
```

Symbolet `⍳` heter Iota, og representerer en funksjon som produserer en serie fra 1 til nummeret som gis som argument. La oss ta var på serien i en variabel vi kaller `n`.

```
n←⍳999
```

Nå trenger jeg å ta modulo 3 av alle tallene. Om et tall modulo 3 er lik 0 er tallet et multippel av 3. APL-funksjonen jeg trenger er `|`, som gir meg resten etter en deling. Om jeg gjør dette:

```
3|n
```

..får jeg en serie som begynner slik:

```
1 2 0 1 2 0 1 2 0 1 2 0 1 ...
```

Som du kan se er tallene i posisjon 3, 6, 9 og 12 lik 0.

Forresten kan jeg slå sammen flere uttrykk med separatoren `⋄`. Dermed blir hele programmet for å generer denne tallrekken som følger:

```
n←⍳999⋄3|n
```

I neste steg sjekker jeg alle tallene om de er lik 0..

```
n←⍳999⋄0=3|n
```

..som gir meg denne tallrekken:

```
0 0 1 0 0 1 0 0 1 0 0 1 0 ...
```

Nå kan jeg bruke vektormultiplisering (funksjonen `×`) mellom den orginale rekken `n` og denne siste rekken for å stå igjen med alle multiplene. Jeg har dermed gjort en slags filtrering:

```
n←⍳999⋄n×0=3|n

0 0 3 0 0 6 0 0 9 0 0 12 0 ...
```

Om jeg så bruker reduksjon (operatoren `/`) sammen med pluss så får jeg slått sammen alle tallene. Jeg tar vare på dem i en variabel jeg kaller `a`:

```
n←⍳999⋄a←+/n×0=3|n
```

Det begynner å ligne på noe, og `a` inneholder nå summer 166833. Nå gjør jeg det samme med alle multipler av 5 (lagret i variabelen `b`) og alle multipler av 15 (lagret i variabelen `c`). Grunnen til at jeg trenger `c` er at det tallet representerer alle tall som er med i både `a` og `b`, og som derfor må trekkes fra det endelige svaret for at de ikke skal telle med to ganger.

Her er programmet sålangt:

```
n←⍳999⋄a←+/n×0=3|n⋄b←+/n×0=5|n⋄c←+/n×0=15|n
```

Det eneste som gjenstår nå er å plusse sammen `a` og `b` og så trekke fra `c`:

```
n←⍳999⋄a←+/n×0=3|n⋄b←+/n×0=5|n⋄c←+/n×0=15|n⋄a+b-c
```

..og APL gir meg det korrekte svaret 233168.

## Erfaring sålangt

Dette var mitt aller første APL program. Jeg begynte uten noen som helst kunnskap om språket, og lærte meg det jeg trengte i løpet av ca en time. All informasjonen jeg trengte fant jeg på [APL Wiki's side om de innebygde funksjonene](http://aplwiki.com/LearnApl/BuiltInFunctions), og jeg brukte [tryapl.org](http://tryapl.org/) til å eksperimentere og evaluere programmet.

Kanskje er jeg litt sær, men jeg synes det å lære meg APL var kjempegøy. Det er som å løse et avansert puslespill eller en logisk gåte. Det minner også litt om å kode i ren Lambda calculus ([se denne bloggposten](http://blog.kjempekjekt.com/2013/09/19/lambda-til-kaffen-del-1/)), men man har litt flere byggeklosser og datatyper så man kan faktisk løse reelle problemer med språket.

## Variasjoner

Her følger noen flere varianter jeg lagde av programmet mitt, som bruker litt ulike funksjoner og muligheter. Først er et hvor jeg definerer en funksjon `f`, slik at jeg unngår å repetere logikken for å summere multipler:

```
n←⍳999⋄f←{+/⍺×0=⍵|⍺}⋄a←n f 3⋄b←n f 5⋄c←n f 15⋄a+b-c
```

I stedet for å ta `n` inn som et av argumentene kan `f` bruke `n` direkte. Da blir det en mere kompakt løsning:

```
n←⍳999⋄f←{+/n×0=⍵|n}⋄(f 3)+(f 5)-(f 15)
```

Jeg kan også bruke reduksjon til å summere multippelsummen av 3 og multippelsummen av 5:

```
n←⍳999⋄f←{+/n×0=⍵|n}⋄(+/f¨ 3 5) - f 15
```

Her er en interessant løsning hvor jeg "innliner" funksjonen. `m` blir et array med de tre summene jeg er interessert i:

```
n←⍳999⋄m←{+/n×0=⍵|n}¨ 3 5 15⋄m[1]+m[2]-m[3]
```

..og om den løsningen kanskje ikke er kryptisk nok for deg så kan jeg plukke ut og slå sammen de to første summene på en litt annen måte:

```
n←⍳999⋄m←{+/n×0=⍵|n}¨ 3 5 15⋄(+/2↑m)-m[3]
```

## Slutt aldri å lære!

For meg er det å lære en av "meningene" med selve livet. Og å eksperimentere med APL er absolutt synapsekspanderende. Jeg synes alle programmerere burde kjenne til og ha prøvd APL, og er du interessert i å prøve kan du enten gjøre det direkte i browseren med [tryapl.org](http://tryapl.org/) eller du kan installere [GNU APL](https://www.gnu.org/software/apl/).

Synes du den kryptiske syntaksen er fasinerende, men ikke er så opptatt av at språket skal ha hatt historisk betydning, kan du fortsette til min [bloggpost om programmeringsspråket betterave](http://blog.kjempekjekt.com/2011/12/16/betterave/).
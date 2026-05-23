---
title: "Sende SMS med Nimrod"
layout: post
link: http://blog.kjempekjekt.com/2014/03/04/sende-sms-med-nimrod/
date: 2014-03-04T16:46:03.136Z
tags:
  - Nimrod
  - SMS
---
Dette er min andre post om *Nimrod*, et programmeringsspråk jeg nettopp har oppdaget, og som var såpass interessant at jeg bestemte meg for å bruke litt tid på å lære det.

I den første posten løste jeg Euler1 - min _hello world_ jeg alltid løser aller først når jeg lærer nye språk. Den _andre_ tingen jeg som regel gjør er å se hvordan jeg kan sende en SMS. Dette er egentlig bare en yrkesskade, men det er en grei måte å teste ut hvordan man gjør *webkall*, enkel *strengbehandling* og *input fra kommandolinjen*.

Det jeg skal lage er altså et lite konsollprogram som ber om input fra brukeren, og som sender en SMS via et av [PSWinCom](http://pswin.com) sine aller enkleste API'er - et http GET request.

## Let's do it

Først må jeg importere et par moduler som jeg skal bruke..

```ruby
import httpclient, strutils
```

Jeg må bygge opp en URL som jeg skal bruke til å sende tekstmeldingen. Jeg starter med å definere variabelen `req` med adressen til riktig endepunkt

```ruby
var req = "http://sms.pswin.com/http4sms2/send.aspx"
```
Deretter lager jeg en liten prosedyre for å hjelpe meg å be brukeren om de ulike parametrene. Prosedyren konkatenerer navn og verdi på adressen i `req`.

```ruby
proc promptParameter(label: string) =
  stdout.write label
  req.add label
  req.add(stdin.readline.replace(" ","+"))
```

Og så kan jeg bruke den til å be om brukernavn, passord, mottakernummer og selve meldingen.

```ruby
promptParameter "?USER="
promptParameter "&PW="
promptParameter "&RCV="
promptParameter "&TXT="
```

Nå er vi klare får å gjøre webkallet, og det er så enkelt som å si:

```ruby
let resp = get(req)
```

`resp` representerer responsen (si det fort fem ganger!), og jeg avslutter med å skrive ut den ferdige URL'en samt statuskoden og resultatet fra SMS Gatewayen:

```ruby
echo "Request: ", req
echo "Response status: ", resp.status
echo "Response body: ", resp.body
```

## Og så kan vi kompilere og kjøre programmet
Jeg åpner PowerShell og forteller nimrod at den skal kompilere sms.nim.

```
PS C:\dev\nimrod-test> nimrod.exe compile .\sms.nim
```

Nimrod spytter ut gcc-kommandoene den kjører og noen hint, og så er den ferdig og jeg har en native `sms.exe` klar til å kjøres:

```bash
PS C:\dev\nimrod-test> .\sms.exe
?USER=gatewayuser
&PW=gatewaypassword
&RCV=4790696698
&TXT=Dette er en test fra Nimrod
http://sms.pswin.com/http4sms2/send.aspx?USER=gatewayuser&PW=gatewaypassword&RCV=4790696698&TXT=Dette+er+en+test+fra+Kong+Nimrod
Response status: 200 OK
Response body: 0
OK
```

Og det var det; 14 linjer kode for å lage en enkel og liten SMS-klient. Ikke noe å samle på akkurat, men jeg lærte litt mer om å kode i Nimrod.

I neste bloggpost vil jeg skrive et _litt_ større program som jeg også har gjort i mange forskjellige språk - nemlig en stack-basert kalkulator. Så følg med!
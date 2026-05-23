---
title: "En BASIC til Common Lisp kompilator"
layout: post
link: http://blog.kjempekjekt.com/2016/02/11/basic-til-cl-kompilator/
date: 2016-02-11T12:00:22.540Z
tags:
  - Basic
  - Common Lisp
---
Jeg er litt småsyk - sikkert svineinfluensa - så jeg holder meg hjemme et par dager, og fikk da litt tid til å leke meg med [Esrap](http://scymtym.github.io/esrap/), et *packrat-parser* biblotek i Common Lisp.

> "Packrat parsers are parsers for PEGs (Parsing expression grammars) that operate in guaranteed linear time through the use of memoization."
> <small>[source](http://bford.info/packrat/)</small>

##En basic BASIC

Oppgaven jeg tenkte jeg skulle løse var å lage en parser og kompilator for BASIC. Det vil si for en veldig enkel og gammeldags BASIC. Språket skal støtte kommandoene `REM`, `LET`, `IF .. THEN`, `GOTO`, `PRINT` og `END`, samt enkel aritmetikk. Alle linjer må nummereres, og behøver *ikke* listes i riktig rekkefølge.

Her er et eksempel på et program i denne BASIC'en som summerer alle multipler av 3 og 5 under 1000 (min *Hello World*):

```
0000 REM Count multiples of 3 and 5 below 1000

0010 LET I = 3
0011 LET SUM = 0

9000 PRINT SUM
9001 END

0100 LET TEMP = I % 3
0110 IF TEMP = 0 THEN 400

0200 LET TEMP = I % 5
0210 IF TEMP = 0 THEN 400

0300 LET I = I + 1
0310 IF I = 1000 THEN 9000
0320 GOTO 100

0400 LET SUM = SUM + I
0410 GOTO 300
```

Projektet mitt har kalt for **CLEMENY**, som er en Common Lisp-tvist av etternavnet til [John G. Kemeny](https://en.wikipedia.org/wiki/John_G._Kemeny) - en av pionerene bak BASIC. Det ferdige [projektet finner du på Github](https://github.com/tormaroe/clemeny) om du er interessert.

##Parsing

Med Esrap definerer jeg en *grammar* som parser BASIC-koden. Selv om jeg har definert slike ting en del ganger før, så er jeg på ingen måte noen ekspert, og den ble litt til etterhvert som jeg eksperimenterte.

Her er en listing fra Esrap som beskriver resultatet:

```
Grammar PROGRAM:
   PROGRAM         <- (AND (* LINE-TERMINATED) (? LINE)) : T
   LINE-TERMINATED <- (AND (? WSNL) LINE (? WS) (+ NL)) : T
   WSNL            <- (+ (OR WS NL)) : T
   WS              <- (+ (OR #\  #\Tab)) : T
   NL              <- (+ (AND (? #\Return) #\Newline)) : T
   LINE            <- (AND LINE-LABEL (? (AND WS COMMAND))) : T
   LINE-LABEL      <- (AND (? WS) INTEGER) : T
   INTEGER         <- (+ (OR "0" "1" "2" "3" "4" "5" "6" "7" "8" "9")) : T
   COMMAND         <- (OR COMMENT NULLARY-COMMAND UNARY-COMMAND LET-COMMAND
                          IF-COMMAND) : T
   COMMENT         <- (AND "REM" (* (GRAPHIC-CHAR-P CHARACTER))) : T
   NULLARY-COMMAND <- (OR "END") : T
   UNARY-COMMAND   <- (AND (OR "GOTO" "PRINT") WS VALUE) : T
   VALUE           <- (OR NAME INTEGER) : T
   NAME            <- (+ (UPPER-CASE-P CHARACTER)) : T
   LET-COMMAND     <- (AND "LET" WS NAME WS #\= WS EXPRESSION) : T
   EXPRESSION      <- (OR (AND VALUE (? WS) OPERATOR (? WS) VALUE) VALUE) : T
   OPERATOR        <- (OR #\+ #\- #\* #\/ #\%) : T
   IF-COMMAND      <- (AND "IF" WS COMPARISON WS "THEN" WS INTEGER) : T
   COMPARISON      <- (AND VALUE WS (OR #\= #\> #\<) WS VALUE) : T
```

##AST

Når jeg bruker reglene over til å parse BASIC-programmet ender jeg opp med dette abstrakte syntakstreet (AST) i Common Lisp:

```
((0 ("REM" " Count multiples of 3 and 5 below 1000")) 
 (10 ("LET" "I" 3))
 (11 ("LET" "SUM" 0)) 
 (100 ("LET" "TEMP" ("MOD" "I" 3)))
 (110 ("IF" ("=" "TEMP" 0) 400)) 
 (200 ("LET" "TEMP" ("MOD" "I" 5)))
 (210 ("IF" ("=" "TEMP" 0) 400)) 
 (300 ("LET" "I" ("+" "I" 1)))
 (310 ("IF" ("=" "I" 1000) 9000)) 
 (320 ("GOTO" 100))
 (400 ("LET" "SUM" ("+" "SUM" "I"))) 
 (410 ("GOTO" 300)) 
 (9000 ("PRINT" "SUM"))
 (9001 ("END"))) 
```

##Kompilering

Men hvordan skal jeg så kompilere dette til eksekverbar kode? Jo, Common Lisp har en interesang operator som heter [`TAGBODY`](http://clhs.lisp.se/Body/s_tagbod.htm#tagbody). Den lar deg egentlig lage en slags GOTO-struktur, noe som gjør at mappingen fra BASIC til Common Lisp blir ganskel enkel.

Så med kun noen få linjer kode transformerer jeg syntakstreet til denne strukturen:

```
(BLOCK NIL
  (LET (TEMP I SUM)
    (TAGBODY
     0
     10
      (SETF I 3)
     11
      (SETF SUM 0)
     100
      (SETF TEMP (MOD I 3))
     110
      (WHEN (= TEMP 0) (GO 400))
     200
      (SETF TEMP (MOD I 5))
     210
      (WHEN (= TEMP 0) (GO 400))
     300
      (SETF I (+ I 1))
     310
      (WHEN (= I 1000) (GO 9000))
     320
      (GO 100)
     400
      (SETF SUM (+ SUM I))
     410
      (GO 300)
     9000
      (FORMAT T "~A~%" SUM)
     9001
      (RETURN)))) 
```

Om jeg så sender dette til funksjonen [`EVAL`](http://clhs.lisp.se/Body/f_eval.htm#eval) vil summen 233168 printes ut til terminalen.

Done!

Om jeg nå hadde villet kunne jeg ha laget et Common Lisp image (i praksis et selvstendig, kjørbart program) som tok stien til en BASIC-fil som argument, kompilerte koden i minnet, evaluerte den direkte, og så avsluttet. Alternativt kunne kompilatoren skrevet den kompilerte Common Lisp-koden til en fil..., eller den kunne ha produsert et nytt image som når det ble kjørt eksekverte den kompilerte koden.

Men jeg stopper der - det som var gøy var å skrive parseren og å kompilere til Common Lisp-kode.

##Konklusjoner

Esrap var en nokså enkel parser å jobbe med, og med noe prøving og feiling fikk jeg til alt jeg prøvde på. Den virker også å være ganske rask. Jeg kunne ha ønsket meg bedre feilmeldinger i noen tilfeller, men stort sett forstod jeg hva som gikk galt.

Når jeg implementerer programmeringsspråk har jeg oftest implementert tolkere, ikke kompilatorer. Men å kompilere er egentlig både enklere og mere morro. Og Common Lisp er et flott språk å kompilere til/i, fordi kode og data i Lisp er to sider av samme sak (se [homoiconicity](https://en.wikipedia.org/wiki/Homoiconicity)), og fordi Common Lisp er så rikt på egenskaper og støtte for ulike paradigmer.

Så dette gav mersmak.

Ta nå [en titt på koden](https://github.com/tormaroe/clemeny) for å se hvordan det hele virker. Det er ikke mange linjene med kode...

##P.S.

Jeg kodet CLEMENY i SublimeText med en integrert REPL som kjørte Steel Bank Common Lisp.., takket være [*SublimeREPL*](https://sublimerepl.readthedocs.org/en/latest/). Samme hvilket språk du bruker - Clojure, CoffeeScript, Elixir, F#, Lua, Perl, Python, eller andre - og du er interessert i å bruke SublimeText som editor, så er SublimeREPL absolutt noe du bør teste ut.
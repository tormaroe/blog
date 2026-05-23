---
title: "Rekursiv skattejakt"
layout: post
link: http://blog.kjempekjekt.com/2015/12/16/rekursiv-skattejakt/
date: 2015-12-16T08:40:02.361Z
tags:
  - Common Lisp
  - Julekalender
  - Perl
  - Rekursjon
---

![Skattejakt](http://blog.kjempekjekt.com/uploads/2015/12/skattejakt.jpg)

Luke 15 i [Knowit sin julekalender](https://julekalender.knowit.no) skulle ha oss med ut på skattejakt. Oppgaven var ikke vanskeligere enn at den kunne løses "for hånd" på et minutt eller to, men det er jo ikke gøy - her skulle det kodes!

Oppgaven lød:

> [Tabellen] skal tolkes som et skattekart. Verdiene i cellene er hint til hvor skatten ligger gjemt. Hver celle inneholder en verdi mellom 11 og 55. For hver verdi representerer det mest signifikante sifferet radnummeret og det minst signifikante sifferet kolonnenummeret til cellen som inneholder neste hint. Start i cellen øverst til venstre (1,1), bruk hintene til å søke deg gjennom tabellen. Skatten er gjemt i den cellen hvor verdien er lik sine egne koordinater. Svaret skal gis som en kommaseparert liste med veien til skatten der det første elementet er startcellen og det siste elementet er målcellen.

## Første iterasjon: Todimensjonal liste

Det første jeg tenkte var at når jeg har en matrise som dette skattekartet jo er, så trenger jeg en todimensjonal liste. Jeg ville representere kartet som dette her:

```
 (("34" "21" "32" "41" "25")
  ("14" "42" "43" "14" "31")
  ("54" "45" "52" "42" "23")
  ("33" "15" "51" "31" "35")
  ("21" "52" "33" "13" "23"))
```

Men for å gjøre det litt spennende ville jeg forsøke å *parse* ASCII-tabellen slik den var oppgitt i oppgaven. Deklarasjonen av kartet skulle bli som dette:

```
(defvar *board* 
  (parse-board 5
    "+------------------------+
     ¦ 34 ¦ 21 ¦ 32 ¦ 41 ¦ 25 ¦
     +----+----+----+----+----¦
     ¦ 14 ¦ 42 ¦ 43 ¦ 14 ¦ 31 ¦
     +----+----+----+----+----¦
     ¦ 54 ¦ 45 ¦ 52 ¦ 42 ¦ 23 ¦
     +----+----+----+----+----¦
     ¦ 33 ¦ 15 ¦ 51 ¦ 31 ¦ 35 ¦
     +----+----+----+----+----¦
     ¦ 21 ¦ 52 ¦ 33 ¦ 13 ¦ 23 ¦
     +------------------------+"))
```

Jeg ville altså lage en fuksjon `parse-board`. Første argument er lengden på en rad (eller antall kolonner om du vil), som gjør det litt enklere å parse.

Jeg tenkte videre at det kunne være greit å bruke regulære uttrykk for å parse kartet, så jeg tok en titt på [dokumentasjonen til cl-ppcre](http://weitz.de/cl-ppcre/) (regex-pakken jeg har brukt tidligere). Der fant jeg en spennende makro som ville la meg iterere over alle tallene i tabellen: `do-matches-as-strings`.

Ved å holde rede på hvor mange tall jeg hadde funnet til enhver tid, kunne jeg vite når jeg måtte legge til en ny rad. Og så måtte jeg til slutt passe på å reversese alle listene mine helt til slutt, ettersom alt blir baklengs når man "conser" verdier til en liste (det er alltid mye raskere å putte verdier på starten av en liste). Jeg ednte opp med dette:

```
(defun parse-board (row-length raw)
  (let ((board ())
        (i 0)
        (pattern (format nil "[1-~A]+" row-length)))
    (cl-ppcre:do-matches-as-strings (m pattern raw)
      (when (zerop (mod i row-length))
        (push () board))
      (setf (car board) (cons m (car board)))
      (incf i))
    (reverse (mapcar #'reverse board))))
```

Nå kunne jeg lage en funksjon for å hente ut verdien av en celle, gitt rad- og kolonneindeks:

```
(defun get-cell (row col)
  "Note: Zero-based indexes"
  (nth col (nth row *board*)))
```

Men for å vite hva neste rad- og kolonneindeks var, basert på verdien i en celle, trengte jeg også denne funksjonen:

```
(defun get-row-and-column (v)
  "Returns a pair of zero-based indexes"
  (cons (1- (parse-any-value (subseq v 0 1)))
        (1- (parse-any-value (subseq v 1 2)))))
```

(`parse-any-value` som benyttes her har jeg definert i tidligere blogposter.)

Nå gjenstod det bare å lage en rekursiv funksjon som startet i den første cellen og fortsatte til den fant en celle som pekte til seg selv. Underveis måtte den ta vare på stien den fulgte (`path`). Jeg valgte å implementere den slik:

```
(defun find-path (v &key (path ()))
  (let* ((next-point (get-row-and-column v))
         (next-v (get-cell (car next-point)
                           (cdr next-point))))
    (if (equal v next-v)
      (reverse (cons next-v path))
      (find-path next-v
                 :path (cons v path)))))
```

Dermed kunne jeg finne løsningen - formatert sånn som Knowit ville - slik som dette:

```
  (format t "~{~A~^,~}"
          (find-path "11"))
```

Merk at format-strengen jeg bruker faktisk itererer over alle verdiene i listen, og putter et komma mellom hvert element. Kryptisk men kraftig!

Denne løsningen fungerer, men det er noe som ikke er så veldig tilfredstillende med den. Det er litt *knotete* å holde rede på forskjellen mellom koordinatverdiene i cellene og indeksene i den todimensjonale listen. La oss se om vi kan komme opp med noe bedre. 

## Andre iterasjon: Association list

I forrige blogpost, [Opp-ned-tall](http://blog.kjempekjekt.com/2015/12/15/opp-ned-tall/), fortalte jeg om *plist* (property list). En annen, listebasert datastruktur ofte brukt i Common Lisp kalles **alist**, eller *association list*. Også denne brukes til å mappe en nøkkel til en verdi, men hvert par av nøkkel og verdi ligger i listen som en cons-celle. *Alisten* er mere anvendelig enn *plisten*.

Hva om jeg bruker en slik liste til å representere kartet? Hver celle inneholder koordinatene til en annen celle, så da kan jo den første være nøkkelen og den andre være verdien...

Jeg vil altså representere kartet på denne måten:

```
(("55" . "23") ("54" . "13") ("53" . "33")
 ("52" . "52") ("51" . "21") ("45" . "35") 
 ("44" . "31") ("43" . "51") ("42" . "15")
 ("41" . "33") ("35" . "23") ("34" . "42") 
 ("33" . "52") ("32" . "45") ("31" . "54")
 ("25" . "31") ("24" . "14") ("23" . "43") 
 ("22" . "42") ("21" . "14") ("15" . "25") 
 ("14" . "41") ("13" . "32") ("12" . "21") 
 ("11" . "34"))
```

Da slipper jeg å forholde meg til at dette er et koordinatsystem - *i alle fall når jeg skal finne løsningen* - det er bare en rekke verdier som peker til andre verdier.

For å få til dette må vi endre `parse-board`. Her må jeg derimot holde track på radnummer og kolonnenummer, sånn at jeg kan sette inn riktig nøkkel. Sammenlign gjerne denne med versjonen presentert i første iterasjon:

```
(defun parse-board (row-length raw)
  (let ((board ())
        (row 1) (col 1)
        (pattern (format nil "[1-~A]+" row-length)))
    (cl-ppcre:do-matches-as-strings (m pattern raw)
      (push (cons (format nil "~A~A" row col) m) 
            board)
      (if (zerop (mod col row-length))
        (setf row (1+ row) col 1)
        (incf col)))
    board))
```

Nå kan jeg droppe `get-cell` og `get-row-and-column`, de behøver vi ikke lengre. Derimot lager jeg en ny liten hjelpefunksjon som gir meg verdien til en celle:

```
(defun get-cell-value (cell)
  (cdr (assoc cell *board* 
              :test #'equal)))
```

`assoc` er en fuksjon som brukes på alister. Den returnerer både nøkkel og verdi, så jeg må bruke `cdr` til å plukke verdien. Om jeg nå evaluerer for eksempel `(get-cell-value "11")` så får jeg ut verdien `"34"`.

Dermed kan jeg modifisere `find-path`; den beholder samme struktur som tidligere, men blir samtidig noe enklere:

```
(defun find-path (cell &key (path ()))
  (let ((next (get-cell-value cell)))
    (if (equal cell next)
      (reverse (cons next path))
      (find-path next
                 :path (cons cell path)))))
```

## Likhet

La du merke til at jeg i kallet til `assoc` sa `:test #'equal`? Hva var det for noe?

Common Lisp har mange måter å sammenligne verdier på. Du trodde kanskje det var litt *overkill* og i alle fall forvirrende å ha for eksempel både dobbelerlik (`==`) og trippelerlik (`===`) i JavaScript? I Common Lisp er det "mye værre"...

`=` brukes til å sammenligne tall. Tallene behøver ikke være av samme type:

```
(= 1 2) => NIL
(= 2 2.0) => T
```

`eq` brukes til å sammenligne identitet. Like symboler er identiske, og to referanser til samme objekt er identiske:

```
(eq 'foo 'foo) => T
(eq 1.0 1.0) => NIL
(let ((x (cons 1 2))) (eq x x)) => T
```

`eql` sammenligner identitet, men også tall og tegn. Typen må være lik:

```
(eql 1.0 1) => NIL
(eql 1.0 1.0) => T
```

`equal` fungerer som `eql`, men sammenligner også lister (rekursivt), strenger og bit-vektorer:

```
(equal "moo" "moo") => T
(equal "moo" "MoO") => NIL
(equal (cons 1 2) (cons 1 2)) => T
(equal 1.0 1) => NIL
(equal 1.0 1.0) => T
```

`equalp` fungerer som `equal`, men sammenligner også andre sekvenser enn lister, og strenger sammenlignes *case insensitively*. Tall behøver ikke ha samme type:

```
(equalp "moo" "MoO") => T
(equalp (vector 2 3 4) (vector 2 3 4)) = T
(equalp 1.0 1) => T
(equalp 1.0 1.0) => T
```

Er det mulig? Hvem klarer å huske alt dette da? Ikke vet jeg, men det er faktisk ganske stilig. Mange funksjoner som sammenligner elementer (som for eksempel `assoc`) bruker én av disse likhets-funksjonene som default, men lar deg samtidig spesifisere en alternativ test - sånn at du kan overstyre. Og det var det jeg gjorde da jeg brukte `assoc`, fordi jeg skulle sammenligne strenger og derfor trengte `equal`.

Dette var kanskje et sidespor, men det var et viktig ett.

## Tredje iterasjon: Ikke så imperativ..

Løsningen er ganske fin nå, men `parse-board` er fortsatt litt vanskelig å forstå: Den muterer tre variabler i en loop, og selv om det var gøy å finne ut hvordan det skulle gjøres så tror jeg at den kan bli bedre.

Hva om jeg henter ut alle nøklene og alle verdiene hver for seg, og så slår dem sammen? cl-ppcre har faktisk en funksjon `all-matches-as-strings` som returnerer alle treffene i stedet for å iterere over dem, så den kan jeg bruke. Nøklene kan jeg generere med to for-løkker, og jeg kan *zippe* de to sekvensene sammen ved å *mappe* funksjonen `cons` over dem.

Da kan `parse-board` bli slik som dette:

```
(defun parse-board (row-length raw)
  (mapcar #'cons
          ;; KEYS... 
          (loop for x from 1 to row-length
            append (loop for y from 1 to row-length
              collect (format nil "~A~A" x y)))
          ;; VALUES...
          (cl-ppcre:all-matches-as-strings
            (format nil "[1-~A]+" row-length)
            raw))))
```

Dette er i alle fall enklere å forstå for *meg*, og nå er jeg endelig fornøyd!

## Trace

Når man jobber interaktivt i REPL, og kanskje særlig når man jobber med rekursive funksjoner, så får man av og til behov for å debugge litt; ofte skriver jeg ut tilstanden på ulike variabler for å se hva programmet gjør.

En snedig ting du kan gjøre er å aktivere **tracing** for enkelte, utvalgte funksjoner. Om jeg for eksempel skrur på tracing i dette tilfellet, med `(trace find-path)`, og så kjører koden, så vil jeg få output lignende skjermdumpen nedenfor (hvor jeg har brent bort endel av det som skjer i midten).

![Trace output](http://blog.kjempekjekt.com/uploads/2015/12/trace.jpg)

For å skru av tracing evaluerer du `(untrace find-path)`.

## Parsing i Perl

Nå er det på tide å være ærlig: Jeg kom ikke på trikset jeg brukte i andre iterasjon på egenhånd! Det trikset kom jeg på ved å lese en annen utviklers løsning på denne juleluken. Brukeren kaller seg **argggh**, og har løst oppgaven i Perl 6.

Og løsningen er faktsk veldig interessant, for den viser hvordan man kan implementere en parser basert på en *grammar* i ren Perl-kode - ikke helt ulikt hva man kan gjøre i Rebol (jeg nevner det fordi jeg [blogget om det på julaften i 2011](http://blog.kjempekjekt.com/2011/12/24/en-euler-dsl/)).

Jeg håper *argggh* synes det er greit at jeg gjengir koden hans/hennes i sin helhet her:

```
#!/usr/local/bin/perl6

my $map-text = q:to/EOI/;
+------------------------+
¦ 34 ¦ 21 ¦ 32 ¦ 41 ¦ 25 ¦
+----+----+----+----+----¦
¦ 14 ¦ 42 ¦ 43 ¦ 14 ¦ 31 ¦
+----+----+----+----+----¦
¦ 54 ¦ 45 ¦ 52 ¦ 42 ¦ 23 ¦
+----+----+----+----+----¦
¦ 33 ¦ 15 ¦ 51 ¦ 31 ¦ 35 ¦
+----+----+----+----+----¦
¦ 21 ¦ 52 ¦ 33 ¦ 13 ¦ 23 ¦
+------------------------+
EOI

grammar TreasureMapGrammar {
    token TOP {
        [ <hsep> \n [ <vsep> \h* <hint> \h* ]+ <vsep> \n ]+ <hsep>
    }
    token hsep { \+ <[-+]>+ \¦? }
    token vsep { \¦ }
    token hint { \d+ }
}

class TreasureMap {
    has $.i = 0;
    has $.j = 0;
    has %.hints;
    method hsep($/) { $!i++; $!j = 0 }
    method vsep($/) { $!j++ }
    method hint($/) { %!hints{$!i ~ $!j} = ~$/ }
    method find-treasure($pos) {
        return ($pos) if $pos eq %.hints{$pos};
        return ($pos, |self.find-treasure(%.hints{$pos}));
    }
}

my $map = TreasureMap.new;
TreasureMapGrammar.parse($map-text, :actions($map));
say $map.find-treasure('11').join(',');

```

Jeg fikk nesten lyst til å lære meg Perl nå!!

.. og det er bare 8 dager igjen til Jul ..
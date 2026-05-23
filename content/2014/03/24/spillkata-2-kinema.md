---
title: "Spillkata 2: Kinema"
layout: post
link: http://blog.kjempekjekt.com/2014/03/24/spillkata-2-kinema/
date: 2014-03-24T21:17:53.002Z
tags:
  - Basic
  - Scheme
  - Lisp
  - Kata
---
<img src="http://blog.kjempekjekt.com/uploads/2014/03/throw_ball.jpg" class="pull-right" style="margin-left:20px;margin-bottom:8px;"/>I posten [Spillkata: Word](http://blog.kjempekjekt.com/2014/03/23/spillkata-word/) startet jeg med et konsollbasert spill utviklet i BASIC i 1978, og implementerte min egen variant i Chicken Scheme. I denne posten her tar jeg for meg et nytt spill fra [den samme kilden](http://www.atariarchives.org/basicgames/)...

Spillet heter **Kinema**, og er på kun 34 linjer BASIC. Kinema er et kunnskapsspill hvor en ball kastes opp i luften med en gitt hastighet, og du skal svare på tre spørsmål:

* Hvor høyt går ballen?
* Hvor lang tid tar det før ballen har returnert?
* Hvilken fart har ballen etter X sekunder?

Denne gangen vil jeg i litt mere detalj vise hvordan jeg oversetter programmet linje for linje.

##Spillforløp
Her er et eksempel på hvordan det ser ut når en kjører Kinema-spillet mitt:

    $ ./kinema 
    
                       KINEMA
      Adaption of BASIC computer game from 1978
    
    
    A ball is thrown upwars at 30 meters per second.
    
    How high will it go (in meters)? 40
    Close enough.Correct answer is 45.0
    How long until it returns (in seconds)? 5
    Not even close....Correct answer is 6
    What will its velocity be after 4.5 seconds? -33
    Not even close....Correct answer is -15.0
    
    1 right out of 3.

Etter at jeg er ferdig med disse tre spørsmålene genereres en ny, tilfeldig velocity, og spillet begynner på nytt.

##Orginalen
Her følger den orginale BASIC-koden. Den er ikke så veldig vanskelig å forstå. Hver linje starter med et linjenummer, og strukturen i programmet skapes gjennom kommandoene `GOSUB`, `GOTO` og `IF .. THEN`.

    10 PRINT TAB(33);"KINEMA"
    20 PRINT TAB(15);"CREATIVE COMPUTING  MORRISTOWN, NEW JERSEY"
    30 PRINT; PRINT; PRINT
    100 PRINT
    105 PRINT
    106 Q=0
    110 V=5+INT(35*RND(1))
    111 PRINT "A BALL IS THROWN UPWARDS AT";V;"METERS PER SECOND."
    112 PRINT
    115 A=.05*V^2
    116 PRINT "HOW HIGH WILL IT GO (IN METERS)";
    117 GOSUB 500
    120 A=V/5
    122 PRINT "HOW LONG UNTIL IT RETURNS (IN SECONDS)";
    124 GOSUB 500
    130 T=1+INT(2*V*RND(1))/10
    132 A=V-10*T
    134 PRINT "WHAT WILL ITS VELOCITY BE AFTER";T;"SECONDS";
    136 GOSUB 500
    140 PRINT
    150 PRINT Q;"RIGHT OUT OF 3.";
    160 IF Q<2 THEN 100
    170 PRINT "  NOT BAD."
    180 GOTO 100
    500 INPUT G
    502 IF ABS((G-A)/A)<.15 THEN 510
    504 PRINT "NOT EVEN CLOSE...."
    506 GOTO 512
    510 PRINT "CLOSE ENOUGH."
    511 Q=Q+1
    512 PRINT "CORRECT ANSWER IS ";A
    520 PRINT
    530 RETURN
    999 END

Hvis du er ung og ikke har sett noe sånt som dette før så er du kanskje litt overrasket - men sånn som dette kodet altså mange for snart 40 år siden.

Legg merke til at linje 500 til 530 brukes som en prosedyre (som kalles med `GOSUB` på linje 117, 124 og 136).

##Direkte oversette til Scheme
Strategien jeg velger for å implementere en versjon av spillet i Scheme, er å begynne med BASIC-varianten (utkommentert), og så implementere linje for linje så godt jeg kan.

Først må jeg importere et par moduler og skrive koden for å printe ut spillets header:

    (use srfi-13) ; String library
    (use extras) ; random, printf
    
    ;; 10 PRINT TAB(33);"KINEMA"
    ;; 20 PRINT TAB(15);"CREATIVE COMPUTING  MORRISTOWN, NEW JERSEY"
    ;; 30 PRINT; PRINT; PRINT
    (display (string-pad "KINEMA\n" 33))
    (display (string-pad 
                "Adaption of BASIC computer game from 1978" 51))
    (newline)(newline)

BASIC-programmet bruker noen variabler: `Q`, `V`, `A` og `T`. Disse må jeg definere før jeg kan fortsette:

    ;; Variables needed...
    (define Q)
    (define V)
    (define A)
    (define T)

For å kunne loope programmet tilbake til start hver gang man har svart på de tre spørsmålene (`180 GOTO 100`) implementerer jeg det som en rekursiv prosedyre som hele tiden kaller seg selv som det siste den gjør. Jeg kaller prosedyren for `main`:

    (define (main)
      ;; 100 PRINT
      ;; 105 PRINT
      (newline) (newline)
      ; ....

Så kommer initialiseringen av `Q` og `V`...

      ;; 106 Q=0
      (set! Q 0)

      ;; 110 V=5+INT(35*RND(1))
      (set! V (+ 5 (random 35)))

...informasjon om ballen...

      ;; 111 PRINT "A BALL IS THROWN UPWARDS AT";V;"METERS PER SECOND."
      ;; 112 PRINT
      (printf "A ball is thrown upwars at ~A meters per second.\n\n" V)

...og så kommer det første av de tre spørsmålene. 

      ;; 115 A=.05*V^2
      ;; 116 PRINT "HOW HIGH WILL IT GO (IN METERS)";
      ;; 117 GOSUB 500
      (set! A (* .05 (* V V)))
      (display "How high will it go (in meters)")
      (sub-500)

Definisjonen av `sub-500` kommer litt lengre nede. Her er de to neste spørmålene:

      ;; 120 A=V/5
      ;; 122 PRINT "HOW LONG UNTIL IT RETURNS (IN SECONDS)";
      ;; 124 GOSUB 500
      (set! A (/ V 5))
      (display "How long until it returns (in seconds)")
      (sub-500)

      ;; 130 T=1+INT(2*V*RND(1))/10
      ;; 132 A=V-10*T
      ;; 134 PRINT "WHAT WILL ITS VELOCITY BE AFTER";T;"SECONDS";
      ;; 136 GOSUB 500
      (set! T (/ (+ 1 (* 2 (random V))) 10))
      (set! A (- V (* 10 T)))
      (printf "What will its velocity be after ~A seconds" T)
      (sub-500)

Nå gjenstår det å skrive ut antall riktige svar, og å kalle `main` på nytt:

```lisp
  ;; 140 PRINT
  ;; 150 PRINT Q;"RIGHT OUT OF 3.";
  (printf "\n~A right out of 3." Q)

  ;; 160 IF Q<2 THEN 100
  ;; 170 PRINT "  NOT BAD."
  ;; 180 GOTO 100
  (when (> Q 2) 
    (display "  not bad!"))
  (main)) ; END MAIN
```

Og så har jeg jo sagt at det som starter på linje 500 i BASIC-koden egentlig er en prosedyre. Så da implementerer jeg den som en prosedyre i Scheme. GOTO-logikken i BASIC kan enkelt gjøres om til en vanlig `if`, og hele greiene blir til slutt slik:

    (define (sub-500)
      ;; 500 INPUT G
      (display "? ")
      (let ((G (read)))
        ;; 502 IF ABS((G-A)/A)<.15 THEN 510
        ;; 504 PRINT "NOT EVEN CLOSE...."
        ;; 506 GOTO 512
        ;; 510 PRINT "CLOSE ENOUGH."
        ;; 511 Q=Q+1
        (if (> .15 (abs (/ (- G A) A)))
          (begin 
            (display "Close enough.")
            (set! Q (+ Q 1)))
          (display "Not even close...."))
    
        ;; 512 PRINT "CORRECT ANSWER IS ";A
        ;; 520 PRINT
        (printf "Correct answer is ~A\n" A)
    
        ;; 530 RETURN
        ;; 999 END
      ))

Det var det - jeg har en Scheme-implementasjon av KINEMA som fungerer.

Merk at jeg bruker `(read)` til å lese inn input. Dette er en prosedyre som leser gyldige Scheme-uttrykk. Spillet vil derfor tryne kraftig om det brukeren taster inn ikke er et gyldig tall.

##Refakturering
Nå kan jeg gå gjennom programmet og se om jeg kan gjøre noen forbedringer.

Det første jeg tar for meg er variablene. Variabelen `T` viste seg å kun være i bruk ett sted, så jeg fjerner den globale definisjonen. I stedet bruker jeg `let`, og døper om variabelen til `time`.

Variabelen `Q` døper jeg om til `correct-count`, og `V` blir til `velocity`. Den sistnevnte behøver heller ikke være global, og kan defineres med en `let` i `main`.

`sub-500` må også få seg et bedre navn, og jeg lander på `prompt-and-evaluate`. For å skrive ut header velger jeg et _here document_. 

`A`-variabelen kan jeg egentlig droppe, og i stedet sende inn verdien til `prompt-and-evaluate`. Jeg kan også sende inn spørsmålet som skal stilles.

###Ferdig løsning
Når alle kommentarene er fjernet ser spillet mitt dermed slik ut:

    (use srfi-13 extras)
    
    (printf #<<EOF
    
                       KINEMA
      Adaption of BASIC computer game from 1978
    
    EOF
    )
    
    (define correct-count)
    
    (define (prompt-and-evaluate question answer)
      (display question)
      (display "? ")
      (let ((G (read)))
        (if (> .15 (abs (/ (- G answer) answer)))
          (begin 
            (display "Close enough.")
            (set! correct-count (+ correct-count 1)))
          (display "Not even close...."))
        (printf "Correct answer is ~A\n" answer)))
    
    (define (main)
      (newline) (newline)
      (let* ((velocity (+ 5 (random 35)))
             (time     (/ (+ 1 (* 2 (random velocity))) 10)))
    
        (set! correct-count 0)
        (printf 
          "A ball is thrown upwars at ~A meters per second.\n\n" 
          velocity)
      
        (prompt-and-evaluate
          "How high will it go (in meters)"
          (* .05 (* velocity velocity)))
      
        (prompt-and-evaluate
          "How long until it returns (in seconds)"
          (/ velocity 5))
      
        (prompt-and-evaluate
          (sprintf "What will its velocity be after ~A seconds" time)
          (- velocity (* 10 time)))
      
        (printf "\n~A right out of 3." correct-count)
        (when (> correct-count 2) (display "  not bad!"))
        (main)))
    
    (main)

[Finnes også som Gist](https://gist.github.com/tormaroe/9749438)..

Jeg håper du synes dette var sånn passe lærerikt. Jeg synes i alle fall dette er en grei måte å gi meg selv noe å gjøre mens jeg øver meg, og anbefaler deg å gjøre det samme. Du trenger selvfølgelig ikke konvertere til _Scheme_ - velg det språket _du_ har lyst til å beherske bedre!
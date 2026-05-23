---
title: "Hello, Scheme"
layout: post
link: http://blog.kjempekjekt.com/2014/03/20/hello-scheme/
date: 2014-03-20T20:27:10.211Z
tags:
  - Scheme
  - Lisp
---
I går hadde vi et par utviklere på besøk på kontoret, og det viste seg at de var _lispere_; de utviklet i både Clojure og Scheme (som altså er to Lisp-dialekter - er du ikke kjent med Lisp kan du ta en titt på posten [Lisp for Dummies](http://blog.kjempekjekt.com/2010/08/02/lisp-for-dummies/)). Jeg ante ikke at vi hadde folk som skrev produksjonskode i Clojure i Bergen, men det har vi altså.

Dette minte meg på hvor mye jeg savner å bruke Lisp. Og så kom jeg på at selv om jeg har eksperimentert endel med både Clojure og Common Lisp så har jeg **faktisk aldri forsøkt Scheme**.

Mer inspirasjon behøvde jeg ikke :)

<p class="text-center"><img src="http://blog.kjempekjekt.com/uploads/2014/03/chicken-small.png"></p>

Nå har jeg installert [Chicken Scheme](http://www.call-cc.org/) og lekt meg med det noen timer. Jeg har gjort akkurat de samme øvelsene som [da jeg eksperimenterte med Nimrod](http://blog.kjempekjekt.com/tags/nimrod):

1. Jeg har løst oppgave #1 fra Project Euler
2. Jeg har brukt Scheme til å sende SMS
3. Jeg har implementert en stack-basert kalkulator

All denne koden presenterer jeg her..

##Euler 1
For dem som ikke husker det: I denne oppgaven skal vi finne summen av alle multipler av 3 eller 5 under 1000.

Først importerer jeg et par moduler. `srfi-1` gir meg tilgang til listefunksjoner som `filter` og `fold`, mens `extras` gir meg en `printf`-funksjon.

    (use srfi-1 extras)

En enkel funksjon for å lage en serie med tall fant jeg derimot ikke, så jeg lagde min egen rekursive `range`:

    (define (range from to)
      (define (range-inner from to acc) 
        (if (<= from to)
          (range-inner from (- to 1) (cons to acc))
          acc))
      (range-inner from to '()))

Så lagde jeg en funksjon for å sjekke om et tall var en multippel av 3 eller 5. Her tok jeg litt av, men det er greit når man eksperimenterer...

    (define (multiple-of n)
      (lambda (a)
        (zero? (modulo a n))))
    
    (define multiple-of-3 (multiple-of 3))
    (define multiple-of-5 (multiple-of 5))
    
    (define (multiple-of-3-or-5 a)
      (or (multiple-of-3 a)
          (multiple-of-5 a)))

Og så kommer selve løsningen, som lager en _range_, filtrerer ut multiplene, og summerer tallene sammen ved bruk av `fold`.

    (define (euler-1)
      (fold + 0
            (filter multiple-of-3-or-5 
                    (range 1 999))))

Nå gjenstår det bare å kalle `euler-1` og skrive ut resultatet:

    (printf "~A~%" (euler-1))

###Scheme kan bli til Clojure
Clojure har noen veldig fine makroer som ikke er så vanlige i andre Lisper, men Chicken Scheme har en modul som heter `clojurian` som inneholder noen av dem, blant annet den jeg bruker her som kalles _thrush-kombinatoren_:

    (use clojurian-syntax)
    
    (->> (range 1 999)
         (filter multiple-of-3-or-5)
         (fold + 0)
         (printf "~A~%"))

Her gjør jeg altså det samme som i løsningen over, men denne varianten er mye enklere å lese.

###Scheme kan bli til Common Lisp
Chicken Scheme har også moduler som er inspirert av Common Lisp, og her løser jeg oppgaven ved hjelp av den fantastiske loop-makroen:

    (use loop) ; the greatest macro ever!
    
    (loop for x from 1 below 1000
          when (multiple-of-3-or-5 x)
            sum x into acc
          finally (printf "~A~%" acc))

##Sende SMS
Siden det liksom er [SMS jeg jobber med til daglig](http://pswin.com) så liker jeg å vise hvor enkelt _det_ kan gjøres. Og ved å gjøre det lærer jeg meg hvordan jeg kan konstruere XML i språket jeg jobber med, og hvordan jeg gjør HTTP-requests.

Først laster jeg noen moduler, definerer en global variabel som holder adressen til SMS gatewayen, og noen funksjoner for å konstruere XML'en:

    (use sxml-serializer
         http-client)
    
    (define gateway "http://gw2-fro.pswin.com:81/")
    
    ;;; Create sxml for a message
    (define (sms-msg id snd rcv text)
      `(MSG (ID ,id)
            (SND ,snd)
            (RCV ,rcv)
            (TEXT ,text)))
    
    ;;; Create sxml for a sms session
    (define (sms-session user pass msglst)
      `(SESSION (CLIENT ,user)
                (PW ,pass)
                (MSGLST ,msglst)))
    
    ;;; Create xml for a sms request
    (define (sms-xml session)
      (sprintf "<?xml version=\"1.0\"?>~%~A~%" 
               (serialize-sxml session)))

Deretter lager jeg funksjoner for å sende via HTTP POST, og å skrive ut resultatet (også XML):

    (define (post-request session)
        (with-input-from-request
          gateway 
          (sms-xml session) 
          read-string))
    
    (define (send-sms session)
      (let ((result (post-request session)))
        (printf "Result XML: ~A~%" result)))

Til slutt kan jeg sende en SMS på denne måten:

    (send-sms
     (sms-session "minbruker" "mittpassord"
       (list (sms-msg 1 "Chicken" "4790696698" 
                      "Hei fra kyllingen!"))))

##Kalkulator-kata
Til slutt skal du få se min stack-baserte kalkulator. Den er strukturert som en REPL (_read eval print loop_), og har ingen muterende state; stacken sendes bare fra funksjon til funksjon slik _funksjonelle programmerere liker det_ ;)

    ;;;
    ;;; An interactive stack-based calculator
    ;;;
    
    (use matchable extras)
    
    (define (calc-repl)
      
      ;; READ user input
      (define (calc-read stack)
        (printf "? ")
        (cons (read-line) stack))
    
      (define (stack-op op stack)
        (match stack
          ((a b . rest) (cons (op a b) rest))
          ((x . '()) (cons (op x x) '()))))
    
      ;; EVAL operation
      (define (calc-eval stack)
        (let* ((input (car stack))
               (input-number (string->number input))
               (stack (cdr stack)))
          (cond ((equal? input "q") '()) ; QUIT
                (input-number (cons input-number stack))
                ((equal? input "+") (stack-op + stack))
                ((equal? input "-") (stack-op - stack))
                ((equal? input "*") (stack-op * stack))
                ((equal? input "/") (stack-op / stack))
                (else stack)))) ; DISCARD INPUT
    
      ;; PRINT stack
      (define (calc-print stack)
        (printf "STACK: ~A~%" stack)
        stack)
    
      ;; LOOP around Read Eval Print
      ;; until empty stack
      (define (calc-loop stack)
        (if (pair? stack) 
          (calc-loop 
            (->> stack
              (calc-read)
              (calc-eval)
              (calc-print)))
          'done))
    
      ;; Start with '0' on the stack
      (calc-loop '(0)))
    
    ;; Start calculator
    (calc-repl)

##Konklusjon
Så, hvordan likte jeg Scheme? Det som er fint med språket er at det er minimalistisk, og mye enklere å forholde seg til enn Common Lisp. Samtidig har det endel tilleggsmoduler som sålangt har gitt meg alt jeg har hatt behov for.

I forhold til Clojure blir det litt mye paranteser når jeg bruker `let` og `cond`, men det går det an å vende seg til. Samtidig slipper jeg å forholde meg til JVM'en som Clojure kjører på; Chicken Scheme kompilerer til C og er lynrask!

Det var litt vanskelig _(overraskende vanskelig)_ å finne gode oppslagsressurser på Scheme. Etterhvert fant jeg ut at min beste ressurs var [Chicken Scheme-dokumentasjonens søkefunsjon](http://api.call-cc.org/doc/). Det hjalp at jeg har lest et par bøker som bruker språket ([SICP](http://en.wikipedia.org/wiki/Structure_and_Interpretation_of_Computer_Programs)), sånn at jeg visste hva jeg kunne søke etter.
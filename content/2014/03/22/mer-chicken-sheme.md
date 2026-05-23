---
title: "Mer Chicken Scheme"
layout: post
link: http://blog.kjempekjekt.com/2014/03/22/mer-chicken-sheme/
date: 2014-03-22T00:36:46.980Z
tags:
  - Scheme
  - Lisp
---
Jeg fortsetter å leke meg med programmeringsspråket **Scheme** ([se begynnelsen her](http://blog.kjempekjekt.com/2014/03/20/hello-scheme/)). Nå har jeg begynt å ta for meg [manualen](http://wiki.call-cc.org/man/4/Supported%20language), og eksperimenterer med det meste.

I denne bloggposten dokumenterer jeg noen av de tingene jeg gjør som jeg tenker kan være interessante for andre som vil lære litt Scheme. Artikkelen forutsetter nok litt forståelse for Lisp og/eller funksjonell programmering.

##apply, compose og partial
Scheme har såvidt jeg vet ingen standard `compose`-funksjon (ala `>>` i F# eller [`comp` i Clojure](http://clojuredocs.org/clojure_core/1.2.0/clojure.core/comp)). Men ved å bruke `apply` kan vi lage en enkel en:

    (define (compose f g)
      (lambda args
        (f (apply g args))))

    (filter (compose not zero?) 
            '(0 2 3 0 5))
    ; ===>  (2 3 5)

Jeg tenkte også jeg skulle forsøke å lage en funksjon for _partial application_:

    (define partial
      (lambda (f . args)
        (lambda args2
          (apply f 
            (append args args2)))))
    
    ;; Test: Lag en increment-funksjon
    (define 1+ (partial + 1))
    
    (1+ 3 4)        ; ===>  8
    
    ;; Test: Lag en sum-funksjon
    (define sum (partial fold + 0))
    
    (sum '(1 2 3))  ; ===>  6

##do-iterator
En av de første tingene jeg kom over i manualen i dag var en iterator som kalles [`do`](http://api.call-cc.org/doc/scheme/do). Jeg har aldri sette denne før, så jeg vet ikke hvor utbredt den er bruk. Den minner meg egentlig litt om Common Lisp sin `loop` i bruk, men den er langt mindre leservennlig.

Her er en løsning på Euler oppgave #1 ved hjelp av `do`:

    (define (euler-1)
      (do ((sum 0)
           (i 1 (+ i 1)))
          ((= i 1000) sum)
        (if (multiple-of-3-or-5? i)
          (set! sum (+ sum i)))))

`sum` og `i` opprettes som to variabler med initiell verdi henholdvis 0 og 1. For `i` definerer vi også et steg (inkrementer med 1) for hver iterasjon.

Loopen stoppes når `(= i 1000)`, og da returneres `sum`.

Og for hver iterasjon tester jeg om `i` er en multippel av 3 eller 5. Hvis så er tilfelle legger jeg `i` til `sum`.

##set!
I koden over brukte jeg `set!`, og det er en ganske spennende operator. Første argument kan være en variabel, men det kan også være et uttrykk som aksesserer en del av en datastruktur. 

La meg demonstrere:

    (define foo '()) ; en tom liste
    
    ; Set foo til en liste med tall
    (set! foo '(1 2 0 4 5 6 7 8 9 10))
    
    ; For å hente ut f.eks. tredje element..
    (caddr foo) ;  ===> 0
    
    ; Set tredje element
    (set! (caddr foo) 3)
    
    foo ; ===> (1 2 3 4 5 6 7 8 9 10)

##Association lists
En _aliste_ (association list) er en liste av par. Dette er klassisk Lisp-bruk av cons-celler for å lage omtrent det samme som hashmaps (dictionary, kall det hva du vil).

I eksempelet bruker jeg dette for å konvertere et tall til ord. For å få til dette måtte jeg også slå opp i dokumentasjonen for å finne endel hjelpefunksjoner for strengbehandling.

    (use srfi-13)
    
    (define dict '(( 1 one   ) ( 6 six   )
                   ( 2 two   ) ( 7 seven )
                   ( 3 three ) ( 8 eigth )
                   ( 4 four  ) ( 9 nine  )
                   ( 5 five  ) ( 0 zero  )))
    
    (define (digitchar->word c)
      ;; Example: 
      ;;  (digitchar->word #\1) -> one
      ;;  (digitchar->word #\2) -> two
      (let ((digit (- (char->integer c) 48)))
        (cadr (assv digit dict))))
    
    (define (integer->words n)
      (let ((word-list 
              (string-fold-right 
                (lambda (c acc)
                  (cons (digitchar->word c) acc))
                '()
                (number->string n))))
        (string-join 
          (map symbol->string word-list) 
          " ")))
    
    (display (integer->words 1337))
    ; ===>  one three three seven

Funksjonen som behandler _alisten_ som en oppslagstabell er `assv`. [Se også `assq` og `assoc`](http://api.call-cc.org/doc/scheme/assoc). 

##Promises
Scheme støtter _lazy_ evaluering gjennom prosedyrene `delay` og `force`. Dette kan for eksempel brukes til å definere en uendelig liste, og så plukke ut noen elementer derfra:

    (define a-stream
      (letrec ((next
                (lambda (n)
                  (cons n (delay (next (+ n 1)))))))
        (next 0)))
    
    (define head car)
    (define tail
      (lambda (stream) (force (cdr stream))))
    
    (head (tail (tail a-stream))) 
    ; ===>  2  

##Makroer
Makroer er så spennende fordi det gir Lisp en styrke som andre språk ikke har - med makroer kan du lage _"ny syntaks"_. 

Scheme har en spennende måte å definere makroer på som skiller seg ganske mye fra det jeg er vandt til fra Common Lisp og Clojure. Jeg har ikke satt meg orntlig inn i alt enda, men her er noen eksperimenter...

    (define-syntax n-times
      (syntax-rules ()
         ; Et mønster... 
        ((n-times n expression)
         ; Hva det skal gjøres om til...
         (let loop ((x n))
            (unless (zero? x)
              expression
              (loop (- x 1)))))))
    
    (n-times 10 
      (display "X"))
    ;                ===>  XXXXXXXXXX

Det var alt for denne gang (på tide å legge seg). Men det kommer til å komme mer Scheme på bloggen, det er helt sikkert.
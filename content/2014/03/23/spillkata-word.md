---
title: "Spillkata: Word"
layout: post
link: http://blog.kjempekjekt.com/2014/03/23/spillkata-word/
date: 2014-03-23T01:01:06.867Z
tags:
  - Kata
  - Scheme
  - Lisp
  - Basic
---
Boken **BASIC Computer Games** ble publisert i 1978. Den inneholdt skildekoden til 100 små tekstbaserte spill. Og alt sammen er [scannet og tilgjengelig online](http://www.atariarchives.org/basicgames/). For en gullgruve for utviklere som er interesserte i å se hva man gjorde for snart 40 år siden!

En annen ting du kan gjøre med denne kilden er å re-implementere gamle klassikere i et annet programmeirngsspråk. For øvelsens skyld. Og det har jeg bestemt meg for å gjøre. Denne bloggposten inneholder mitt første spill fra _BASIC Computer Games_, og for å implementere det har jeg valgt Chicken Scheme.

<p class="text-center"><img src="http://blog.kjempekjekt.com/uploads/2014/03/basiccomputergames.jpg"></p>

##Word
Spillet _Word_ minner om _mastermind_, men i Word skal man gjette seg frem til et ord. [Orginalen kan du se her.](http://www.atariarchives.org/basicgames/showpage.php?page=181) Her følger et spillforløp:

    $ csc gamekata-word.csm && ./gamekata-word
    --------------------------------------------------------------------
                                     WORD
    Adaption of original game in BASIC by Charles Reid of Lexington High
    School, Massachusetts. Scheme version by Torbjørn Marø, 2014.
    --------------------------------------------------------------------
    
    I am thinking of a word -- you guess it. I will give you clues to
    help you get it. Good luck!!
    You are starting a new game...
    
    Guess a five letter word? abcde
    There were 0 matches and the common letters were...
    From the exact letter matches, you know.............-----
    
    If you give up, type '?' for your next guess.
    
    Guess a five letter word? fghij
    There were 2 matches and the common letters were...IF
    From the exact letter matches, you know.............F----
    
    If you give up, type '?' for your next guess.
    
    Guess a five letter word? fight
    There were 3 matches and the common letters were...TIF
    From the exact letter matches, you know.............FI--T
    
    If you give up, type '?' for your next guess.
    
    Guess a five letter word? first
    There were 5 matches and the common letters were...FRSIT
    From the exact letter matches, you know.............FIRST
    You have guessed the word. It took 4 guesses!
    Want to play again? no
    
    Thanks for playing - bye bye!

##Implementasjon

Jeg har ikke sett så nøye på hvordan Charles Reid orginalt implementerte spillet. Fokuset mitt var å øve meg på Scheme. Blant annet måtte jeg finne endel prosedyrer for strengbehandling.

Jeg er sånn passe fornøyd med resultatet. Spillet kunne nok hatt godt av litt refakturering for å gjøre det mere leservennlig, men jeg tror det er bra nok til at det kan se _dagens lys_ her på bloggen.

Så her er det i all sin prakt:

    (use srfi-13 extras)
    
    (define header #<<EOF
    --------------------------------------------------------------------
                                     WORD
    Adaption of original game in BASIC by Charles Reid of Lexington High
    School, Massachusetts. Scheme version by Torbjørn Marø, 2014.
    --------------------------------------------------------------------
    
    I am thinking of a word -- you guess it. I will give you clues to
    help you get it. Good luck!!
    EOF
    )
    
    (define words 
      '("SMOKE" "CANDY" "DINKY" "WATER" "TRAIN" "NIGHT" "MIGHT" "FIRST"
        "CHAMP" "WOULD" "CLUMP" "DOPEY" "CRUSH" "EXTRA" "BASIC" "EIGHT"))
    
    (define (random-elem lst)
      (list-ref lst (random (length lst))))
    
    (define (random-sort l)
      (sort l
            (lambda (x y)
              (equal? 0 (random 2)))))
    
    ;;; The GAME-STATE data type
    
    (define-record game-state word
                              current-guess
                              continue
                              matches
                              exact-matches
                              guess-count)
    
    (define (init-game)
      (make-game-state 
        (random-elem words) ; word
        "     "             ; current-guess
        #t                  ; continue
        '()                 ; matches
        "-----"             ; exact-matches
        0))                 ; guess-count
    
    (define (game-state-correct? state)
      (equal? (game-state-exact-matches state)
              (game-state-word state)))
    
    ;;; REPL logic
    
    (define (game-read state)
      (display "\nGuess a five letter word? ")
      (let ((input (read-line)))
        (cond ((equal? input "?") 
               (game-state-current-guess-set! state "?")
               state)
              ((= 5 (string-length input))
               (game-state-current-guess-set! state 
                 (string-upcase input))
               (game-state-guess-count-set! state 
                 (+ (game-state-guess-count state) 1))
               state)
              (else
                (display "Bad input length! ") 
                (game-read state)))))
    
    (define (find-matches state)
      (let loop ((i 0) (matches '()) (exact "-----"))
        (cond 
          ((< i 5)
           (let ((c (substring (game-state-word state) i (+ i 1)))
                 (guess (game-state-current-guess state)))
             (when (string-contains guess c)
               (set! matches (cons c matches))
               (when (= i (string-index guess (string->char-set c)))
                 (set! exact (string-replace exact c i (+ i 1))))))
           (loop (+ i 1) matches exact))
          (else
           (game-state-matches-set! state (random-sort matches))
           (game-state-exact-matches-set! state exact)))))
          
    (define (game-eval state)
      (let ((guess (game-state-current-guess state)))
        (if (equal? guess "?")
          (game-state-continue-set! state #f)
          (find-matches state)))
      state)
    
    (define (game-print state)
      (when (game-state-continue state)
        (printf 
          "There were ~A matches and the common letters were.. ~A~%"
          (length (game-state-matches state))
          (apply string-append (game-state-matches state)))
        (printf 
          "From the exact letter matches, you know........... ~A~%"
          (game-state-exact-matches state))
        (if (game-state-correct? state)
          (printf 
            "You have guessed the word. It took ~A guesses!~%"
            (game-state-guess-count state))
          (printf 
            "~%If you give up, type '?' for your next guess.~%")))
      state)
    
    (define (start-game)
      (display "\nYou are starting a new game...\n")
      (let loop ((state (init-game)))
        (when (and (game-state-continue state)
                   (not (game-state-correct? state)))
          (loop (game-print 
                  (game-eval 
                    (game-read state)))))))
    
    ;;; MAIN
    
    (define (yes-or-no)
      (equal? "Y" (string-upcase (substring (read-line) 0 1))))
    
    (display header)
    (let loop ()
      (start-game)
      (display "Want to play again? ")
      (if (yes-or-no)
        (loop)
        (display "\nThanks for playing - bye bye!\n\n")))

Det var så gøy som jeg hadde håpet å implementere spillet. Det var også litt frustrerende fordi det å analysere forsøkene brukeren taster inn var sånn passe komplekst. Jeg føler jeg fortsatt har MASSE å lære om hvordan jeg bruker Scheme på en god måte, og vil nok bruke det på et par spillkataer til i nær fremtid.

Koden er også [tilgjengelig som en gist](https://gist.github.com/tormaroe/9716815).
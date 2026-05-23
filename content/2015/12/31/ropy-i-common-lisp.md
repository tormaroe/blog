---
title: "Ropy får en tolker i Common Lisp"
layout: post
link: http://blog.kjempekjekt.com/2015/12/31/ropy-i-common-lisp/
date: 2015-12-31T07:55:07.456Z
tags:
  - Common Lisp
  - Diverse prosjekter
  - Esoteriske språk
---

Jeg har nettopp implementert en ny tolker for mitt esoteriske programmeringspråk **Ropy**. Orginalen ble gjort i Ruby i 2012, men nå finnes den altså også i Common Lisp. Du finner begge implementasjonene i samme [repo på Github](https://github.com/tormaroe/ropy/).

Dette skal ikke bli en lang blogpost eller noen full gjennomgang - jeg vil bare trekke frem noen små ting som jeg ikke har vist før.

Btw. så har jeg også opprettet en side for [Ropy på esolangs.org](http://esolangs.org/wiki/Ropy), wikien for esoteriske språk. Det oppfordres til å poste info om egetutviklede språk :)

## Demo

Common_Lisp-folderen i repoen inneholder blant annet filen run.lisp. Om du starter med den.. 

```
$ sbcl --load run.lisp
```

..så vil den laste alle de andre filene, tilby deg å kjøre testene, og til slutt gi deg litt brukerinstruksjoner.

Når Ropy er lastet kan vi bruke tolkeren interaktivt. Jeg kan kalle `parse`, som vil returnere et program basert på Ropykildekode:

```
* (parse "123++")

#S(ROPY-STATE:PROGRAM
   :STACK NIL
   :MEMORY NIL
   :TOKENS #2A((#\1 #\2 #\3 #\+ #\+))
   :I 0
   :J 0
   :DONE NIL
   :SILENT NIL
   :PREVIOUS-DIRECTION :EAST)
```

Så kan vi kjøre programmet med `execute`, som printer ut alle stack-operasjonene underveis, og så returnerer programmets endelige tilstand. `*` i Common Lisp REPL er en peker til siste evaluerte verdi (resultatet av `parse` i dette tilfellet).

```
* (execute *)

1 => [1,
2 => [1,2,
3 => [1,2,3,
+ => [1,5,
+ => [6,

#S(ROPY-STATE:PROGRAM
   :STACK (6)
   :MEMORY NIL
   :TOKENS #2A((#\1 #\2 #\3 #\+ #\+))
   :I 0
   :J 4
   :DONE T
   :SILENT NIL
   :PREVIOUS-DIRECTION :EAST)
```

Og vi kan be om resultatet:

```
* (result *)

6
```

## Structs i Common Lisp

Til nå har jeg brukt CLOS-objekter (Common Lisp Object System) når jeg har hatt behov for dataobjekter med ulike properties, og når det ikke har vært nok å bare bruke lister.

Men Common Lisp har også *structs*, som er enklere - og som egentlig er et bedre valg om man ikke trenger polimorfisme. I min Ropy-tolker holder jeg all *state* i en struct som ser slik ut:

```
(defstruct program
  (stack () :type list)
  (memory () :type list)
  (tokens nil :type (simple-array character (* *)))
  (i 0 :type fixnum)
  (j 0 :type fixnum)
  done 
  silent 
  (previous-direction :east :type keyword))
```

`program` har åtte *slots*, seks av dem har en default verdi og er typet. Det litt kryptiske uttrykket `(simple-array character (* *))` representerer et todimensjonalt array av characters, med ukjente dimensjoner.

## Makroer som definerer funksjoner

For å definere operasjonene i Ropy lagde jeg noen makroer. De kompilerer en en funksjon med `defun`, og legger den samtidig til i et register over operasjoner (`*operations*`). 

```
;;; defop Macros
;;;
;;  This is mostly masturbatory I guess
;;  I just wanted to see how it would turn out.

(defmacro defop (name token &body body)
  "Defines an operation function and registers it in 
   *operations*. The operation will have access to the
   program state by the anamorphic variable 'program'."
  `(progn 
     (defun ,name (program) ,@body)
     (push (cons ,token (function ,name)) 
           *operations*)))

(defmacro defop-push (name token &body body)
  "Like defop, but pushes the result of the operation
   onto the program stack."
  `(defop ,name ,token
     (push-value program (progn ,@body))))

(defmacro defop-binary (name token &body body)
  "Like defop-push, but pops out two elements from the
   stack which are bound to the anamorphic variables a and b."
  `(defop-push ,name ,token
     (let ((a (:pop program))
           (b (:pop program)))
       ,@body)))
```

Dette lar meg definere operasjonene på denne måten:

```
(defop :pop #\? (pop (program-stack program)))

(defop-binary :add #\+ (+ a b))

(defop-binary :subtract #\- (- a b))

(defop :duplicate #\> 
  (let ((x (:pop program)))
    (push-value program x)
    (push-value program x)))

(defop-push :stringify-stack #\" 
  (format nil "~{~a~}" 
          (mapcar #'code-char 
                  (program-stack program))))
```

## Ny Common Lisp-bok på nyåret

Til slutt et tips.

Edi Weitz, utvikleren bak blant annet cl-ppcre og hunchentoot, har jobbet med en ny bok som vil bli klar i begynnelsen av 2016: *[Common Lisp Recipes](http://weitz.de/cl-recipes/)*.

Boken vil være på rundt 500 sider, og inneholde tips og oppskrifter relatert til webprogrammering, databaser, grafiske brukergrensesnitt, interop med andre språk, multiprosessering, mobilutvikling, debugging, optimalisering, og mer.

Denne boken skal bestilles!
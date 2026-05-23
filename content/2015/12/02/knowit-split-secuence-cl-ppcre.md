---
title: "Knowit provoserer frem split-sequence og cl-ppcre"
layout: post
link: http://blog.kjempekjekt.com/2015/12/02/knowit-split-secuence-cl-ppcre/
date: 2015-12-02T06:38:12.582Z
tags:
  - Julekalender
  - Common Lisp
  - Regex
---

Utviklerne i **[Knowit Labs](http://knowitlabs.no/)** har også laget [en julekalender i år](https://julekalender.knowit.no/). En utviklerkonkurranse i samme stil som jeg gjorde julen 2013. Jeg liker å tro at jeg var en av inspirasjonskildene ;)

Selvfølgelig måtte jeg slenge meg på og løse første oppgave i går. Nå er fristen utløpt, så jeg kan vise frem hvordan jeg løste den. Det var ikke så vanskelig, men siden jeg blant annet fokuserer på Common Lisp i min egen kalender så tenkte jeg at jeg også skulle løse knowits utfordringer i det språket.

Oppgaven presenterte en liste med potensielle "Ruritanianske" personnummer - og man skulle finne ut hvor mange av dem som var gyldige. Et typisk regex-problem.

Her er det jeg skrev for å komme frem til svaret - se på dette som en bonus-teaser i forhold til hva som kommer til å komme av Common Lisp-poster her i desember:

```
(ql:quickload :drakma)
(ql:quickload :cl-ppcre)
(ql:quickload :split-sequence)

(defun get-id-list ()
  (split-sequence:split-sequence-if 
    (lambda (x) (member x '(#\return #\newline)))
    (drakma:http-request "http://pastebin.com/raw.php?i=F8z0JWqa")
    :remove-empty-subseqs t))

(defun valid-p (id)
  (cl-ppcre:scan "^[a-z]{0,3}[0-9]{2,8}[A-Z]{3,}" id))

(defun main ()
  (length (remove-if-not #'valid-p (get-id-list))))

(main)
```

Dette var første gang jeg hadde fått bruk for å splitte en sekvens i Common Lisp, 
og jeg måtte google litt for å finne 
[split-sequence](http://quickdocs.org/split-sequence/). Den viste seg å være en 
ganske fin utility-funksjon.

Ellers synes jeg løsningen ble fin; [drakma](http://weitz.de/drakma/) gjør det 
trivielt å laste ned dataene, og [cl-ppcre](http://weitz.de/cl-ppcre/) *(Portable Perl-compatible regular expressions for Common Lisp)* gjør det 
enkelt å bruke regulære uttrykk. Når jeg tenker meg om kunne jeg nok brukt 
cl-ppcre til å splitte dataene også, men da hadde jeg jo aldri oppdaget split-sequence.

Om jeg bare hadde brukt cl-ppcre hadde `get-id-list` blitt slik:

```
(defun get-id-list ()
  (cl-ppcre:split "\\r\\n"
    (drakma:http-request "http://pastebin.com/raw.php?i=F8z0JWqa")))
```

Jeg anbefaler alle utviklere å [delta på knowits julekalender](https://julekalender.knowit.no/), hvor du blir med i trekningen av valgfri smarttelefon.
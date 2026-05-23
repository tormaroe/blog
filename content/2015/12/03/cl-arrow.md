---
title: "cl-arrow"
layout: post
link: http://blog.kjempekjekt.com/2015/12/03/cl-arrow/
date: 2015-12-03T06:43:13.997Z
tags:
  - Common Lisp
  - Julekalender
  - Rekursjon
---

Det er gøy å løse små programmeringsutfordringer. Spesielt når man forsøker å "drille inn" et språk man ikke har brukt så mye. I går løste jeg oppgave nummer 2 i [Knowit sin julekalender](https://julekalender.knowit.no/), og her er en rask gjennomgang.

Oppgaven gav en serie med aksjekurser. Spørsmålet var hva maksimal fortjeneste ville være om man fikk kjøpe kun én aksje, og så selge den igjen på et senere tidspunkt.

Først laget jeg noen funksjoner som jeg tipper jeg kommer til å få gjenbrukt i mange av oppgavene fremover:

```
(ql:quickload :drakma)

(defun get-pastebin (id)
  (drakma:http-request 
    (format nil "http://pastebin.com/raw.php?i=~A" id)))

(defun split-lines (txt)
  (cl-ppcre:split "\\r\\n" txt))

(defun parse-any-value (x)
  (with-input-from-string (in x)
    (read in)))
```

`parse-any-value` er min lille erstatning for at Common Lisp ikke har noen funksjon for å konvertere en streng til et desimaltall. Den bruker rett og slett read-biten av Read-Eval-Print-Loop til å tolke en hvilken som helst streng som kan bli en gyldig Common Lisp verdi.

Nå kan jeg hente ned og parse dataene:

```
(defun get-rates ()
  (mapcar #'parse-any-value
          (split-lines (get-pastebin "sJVZp7BH"))))
```

*MEN* jeg kjenner at jeg savner threading-makroen fra Clojure / pipeline-operatoren fra F#. Derfor undersøkte jeg hvordan jeg kunne få den i Common Lisp, og fant pakken `cl-arrow`:

```
(ql:quickload :cl-arrows)
(use-package :cl-arrows)
```

Dermed kan vi refakturere `get-rates`:

```
(defun get-rates ()
  (->> "sJVZp7BH"
       get-pastebin
       split-lines
       (mapcar #'parse-any-value)))
```

Mye bedre!

Da gjenstår selve løsningen, som er en rekursiv *"list-eater"*. Underveis tar den vare på den sålangt høyeste profitten den har funnet, og for hvert element i listen finner funksjonen den høyeste påfølgende verdien, og ser om det resulterer i et bedre resultat.

```
(defun find-larges-diff (rates acc)
  (if (cdr rates)
    (let* ((buy-rate (car rates))
           (tail (cdr rates))
           (sell-rate (reduce #'max tail))
           (acc? (- sell-rate buy-rate)))
      (find-larges-diff tail (max acc acc?)))
    acc))  
```

Og nå som jeg har *threading* finner jeg svaret sånn:

```
(-> (get-rates)
    (find-larges-diff 0))
```

PS: Dette var bare en bonusluke, [dagens egentlige blogpost finner du her](http://blog.kjempekjekt.com/2015/12/03/may-of-t/).
---
title: "cl-utilities"
layout: post
link: http://blog.kjempekjekt.com/2015/12/06/compose/
date: 2015-12-06T07:31:11.370Z
tags:
  - Common Lisp
  - Julekalender
---

Luke nummer fem i [Knowit sin julekalender](https://julekalender.knowit.no) hadde en oppgave hvor man gitt 22282 ord skulle finne antallet ord som kunne danne et anagram av ett av de andre. Tidlig lørdag morgen hadde jeg ikke noe bedre å finne på enn å løse også denne oppgaven i Common Lisp.

Den endelige løsningen ble en funksjonell pipeline:

```
(->> "sGbqMyCa"
     get-pastebin
     split-lines
     (mapcar (compose #'list-to-string 
                      #'sort-chars 
                      #'string-to-list))
     group-by-identity
     (remove-if #'has-only-one-value-p)
     (mapcar (compose #'1- #'length))
     (reduce #'+)
     print)
```

Jeg starter med pastebin-nøkkelen, henter dataene med `get-pastebin` og splitter til en liste med `split-lines`. 

Deretter sorterer jeg bokstavene i hvert ord. For å få til det må jeg først konvertere hvert ord til en liste av bokstaver, så sortere denne, og til slutt konvertere tilbake til en streng. Jeg kunne gjort dette ved å iterere over listen tre ganger, sånn:

```
(->> 
     ....
     (mapcar #'string-to-list)
     (mapcar #'sort-chars) 
     (mapcar #'list-to-string) 
     ....
     )
```

..men i stedet komponerer jeg en ny funksjon som kombinerer de tre stegene, og mapper kun én gang. Common Lisp har ikke noen compose-funksjon ut av boksen, men [cl-utilities](http://quickdocs.org/cl-utilities/) er en nyttig pakke som blant annet har dette.

Etter å ha sortert bokstavene i hvert ord vil ord som kan danne anagrammer være identiske. Dermed kan jeg gruppere på ordene, fjerne de det bare finnes ett av, telle alle som gjenstår, og summere sammen.

Underveis her delegerer jeg til endel hjelpefunksjoner. `get-pastebin` og `split-lines` har jeg vist [i en tidligere post](http://blog.kjempekjekt.com/2015/12/03/cl-arrow/), og her følger resten:

```
(defun string-to-list (s)
  (coerce s 'list))

(defun list-to-string (xs)
  (concatenate 'string xs))

(defun sort-chars (charlist)
  (sort charlist #'char-lessp))

(defun group-by-identity (lists)
  (group-by lists :key #'identity 
                  :value #'identity))

(defun has-only-one-value-p (grouping)
  ;; A grouping is a list where
  ;; car => the key
  ;; cdr => the values
  (= (length grouping) 2))
```

Totalt bruker jeg fem eksterne pakker i denne løsningen:

```
(ql:quickload :drakma)       ; http-request
(ql:quickload :cl-ppcre)     ; split
(ql:quickload :cl-arrows)    ; ->>
(ql:quickload :cl-utilities) ; compose
(ql:quickload :group-by)     ; group-by
```
---
title: "Mine første linjer Rust"
layout: post
link: http://blog.kjempekjekt.com/2017/02/12/mine-forste-linjer-rust/
date: 2017-02-12T22:23:36.926Z
tags:
  - Rust
  - Common Lisp
---
Denne uken fikk jeg behov for vaske en fil med 3,6 millioner mobilnumre (fil A) mot en fil med noen hundre tusen numre som skulle ekskluderes (fil B). I mengdelære ville man sagt *differansen* mellom B og A, eller A&#8726;B.

Det finnes nok mange måter og verktøy man kan bruke for å løse dette, men for meg er dette en typisk mulighet til å kode litt - og muligheter til å kode lar jeg skjelden gå fra meg.

Jeg tenkte det var på tide å prøve et nytt programmeringsspråk igjen; at det var på tide å prøve **[Rust](https://www.rust-lang.org/)**. Men først måtte jeg løse oppgaven i et språk jeg allerede behersker, sånn at jeg ikke hadde press på meg når jeg skulle lære noe helt nytt, og da implementerte jeg løsningen nedenfor i Common Lisp. Den leser inn fil A som en liste, fil B som en hashtabell, itererer over liste A og skriver nummeret til en fil C om det ikke befinner seg i B.

```
(defparameter *a* "C:\\dev\\some_folder\\a.txt")
(defparameter *b* "C:\\dev\\some_folder\\b.txt")
(defparameter *c* "C:\\dev\\some_folder\\c.txt")

(defun clean-line (line)
  (string-trim '(#\Return) line))

(defun file->hash (filename)
  (with-open-file (stream filename)
    (loop for line = (read-line stream nil )
          with hash = (make-hash-table :test 'equal)
          while line
            do (setf (gethash (clean-line line) hash) t)
          finally (return hash))))

(defun file->list (filename)
  (with-open-file (stream filename)
    (loop for line = (read-line stream nil)
          while line
            collect (clean-line line))))

(defmacro with-new-file ((stream filename) &body body)
  `(with-open-file (,stream ,filename :direction :output
                                      :if-exists :supersede
                                      :if-does-not-exist :create)
     ,@body))

(time 
  (let ((list-A (file->list *a*)) 
        (hash-B (file->hash *b*)))
    (with-new-file (stream *c*)
      (flet ((include (x) (not (gethash x hash-B))))
        (loop for line in list-A
              when (include line)
                do (format stream "~a~%" line))))))
```

Jeg fikk litt trøbbel med denne løsningen før jeg skjønte at `read-line` ikke fjernet *carriage return*, og derfor måtte jeg lage funksjonen `clean-line`. Makroen `with-new-file` eksisterer derimot bare for gøy :P

## Men dette skulle jo dreie seg om Rust?!

Ja, nettopp ja. Etter at jeg hadde en fungerende løsning kunne jeg i ro og mak forsøke å kode det samme i Rust. Her er resultatet - mine aller første linjer Rust-kode:

```
use std::collections::HashMap;
use std::io::BufReader;
use std::io::BufRead;
use std::io::Write;
use std::fs::File;
use std::error::Error;

fn main() {

    let a = "C:\\dev\\some_folder\\a.txt";
    let b = "C:\\dev\\some_folder\\b.txt";
    let c = "C:\\dev\\some_folder\\c.txt";

    let b_file = File::open(b).unwrap();
    let b_reader = BufReader::new(&b_file);
    let mut b_hash = HashMap::new();
    for line in b_reader.lines() {
        let l = line.unwrap();
        b_hash.insert(l, true);
    }

    let a_file = File::open(a).unwrap();
    let a_reader = BufReader::new(&a_file);
    let mut a_list: Vec<String> = Vec::new();
	for line in a_reader.lines() {
        let l = line.unwrap();
        match b_hash.get(&l) {
	        Some(_) => (),
	        _ => a_list.push(l),
	    }
    }    

    let mut c_file = match File::create(&c) {
        Err(why) => panic!("couldn't create {}: {}", c, why.description()),
        Ok(file) => file,
    };

    for msisdn in a_list {
    	writeln!(c_file, "{}", msisdn).unwrap();
    }
}

```

## Noen betraktninger..

Her er noen betraktninger jeg gjorde meg underveis. For det første: Dokumentasjonen på rust-lang.org er brukbar. Derimot er det et problem at Rust har utviklet og endret seg så mye siden den første pre-1.0 versjonen - for nå er internett nemlig fullt av eksempler som rett og slett ikke er gyldige lengre. Det gjør det litt vanskelig å google etter kjappe løsninger.

Rust-kompilatore er derimot *veldig* hjelpsom. Rust er jo et sterkt, statist typet språk, og kompilatore fanger opp alt man gjør galt mens man lærer. Men ikke nok med det, den gjør også gjetninger i forhold til hva den antar du mente å gjøre, og foreslår konkrete endringer for å løse kompileringsproblemet. Dette likte jeg godt.

Ellers er det verdt å merke at koden min er ganske *lett* på feilhåndtering. Det legges opp til at man i større grad skal kontrollere for feil, slik jeg har gjort når jeg oppretter `c_file`. Jeg ser for meg at "ekte" Rust-kode inneholder mange slike match-uttrykk for å kontrollere om man har en OK tilstand eller en error.

Jeg konkluderer med at Rust ikke var så skummelt å prøve - jeg løste oppgaven raskt nok. Rust er et spennende verktøy, og å kunne utvikle sikker og effektiv kode som kompileres ned til maskinkode, og som kjører uten en garbage collector, kan sikkert komme godt med på en eller annen fremtidig utviklingsoppgave. Dette vil jeg se mer på.
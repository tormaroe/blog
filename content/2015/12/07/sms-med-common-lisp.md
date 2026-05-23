---
title: "Send SMS med Common Lisp"
layout: post
link: http://blog.kjempekjekt.com/2015/12/07/sms-med-common-lisp/
date: 2015-12-07T10:33:21.833Z
tags:
  - Common Lisp
  - Lisp
  - Julekalender
  - SMS
---

Løsningen for parkeringsreservasjon, som jeg har planer om å implementere i Common Lisp denne julen, trenger å kunne sende SMS. I denne posten beskriver jeg hvordan jeg lager en enkel pakke for å sende meldinger ved å bruke XML-basert API.

Jeg har vist omtrent det samme tidligere i språk som [F#](http://blog.kjempekjekt.com/2013/02/16/sende-sms-med-f/), [Ruby](http://blog.kjempekjekt.com/2010/01/22/dagens-sitat-via-sms/), [Scheme](http://blog.kjempekjekt.com/2014/03/20/hello-scheme/) og [Nim](http://blog.kjempekjekt.com/2014/03/04/sende-sms-med-nimrod/). Dagens Common Lisp-versjon er kort og grei - ikke mer enn 38 linjer, inkludert whitespace. Men blogposten blir nok endel lengre enn det :) 

Den ferdige løsningen er tilgjengelig som [en gist](https://gist.github.com/tormaroe/188306ca71c941ee0739).

## Eksterne pakker

Jeg vil bruke to eksterne pakker i denne løsningen. Den første heter **[drakma](http://weitz.de/drakma/)** og er et populært http-biblotek. Den andre  - **[cl-who](http://weitz.de/cl-who/)** - er en enkel template engine for å konvertere Lisp-kode til HTML (eller i dette tilfellet XML).

Begge pakkene er laget av tyskeren Edi Weitz, som er en av de mest velkjente open source-utviklerne i Common Lisp sfæren, og som har publisert en hel rekke web-relaterte prosjekter; som webserveren [Hunchentoot](http://weitz.de/hunchentoot/) og regex-biblioteket [CL-PPCRE](http://weitz.de/cl-ppcre/) (Portable Perl-compatible regular expressions). Edi er professor i matematikk og computer science ved universitetet i Hamburg, og før det var han freelance hacker i 13 år. Han jobbet typisk for kunder som ikke brydde seg om hvilken teknologi han brukte for å løse problemene deres. Derfor jobbet han i 6-7 av de årene utelukkende med Common Lisp.

![Edi Weitz](http://blog.kjempekjekt.com/uploads/2015/12/edi.jpg) Edi Weitz

I tillegg til disse to pakkene har jeg en ekstern avhengighet til en SMS gateway hos [LINK Mobility](http://www.linkmobility.com/) *(DISCLAMER: Min arbeidsgiver)*.

## Definere pakken 'sms'

La oss opprette en fil vi kaller `sms.lisp`. I den starter vi med en pakkedefinisjon:

    (in-package :cl-user)
    (defpackage :sms
      (:documentation
        "A simple package to send SMS using LINK Mobility")
      (:use :cl)
      (:import-from :drakma :http-request)
      (:import-from :cl-who :with-html-output-to-string :str :esc)
      (:export :<gateway>
               :send-sms))
    (in-package :sms)

Her kan du blant annet se at jeg importerer de symbolene jeg har tenkt å bruke fra drakma og cl-who. Jeg eksporterer også to symboler: `<gateway>` og `send-sms`.

`<gateway>` følger konvensjonen for navngiving av klasser i Common Lisp. Denne vil la brukerne av sms-pakken opprette et objekt som konfigurerer oppkoblingen til SMS-serveren: http-adressen, brukernavn, passord og i tillegg hvilken avsender som skal brukes på SMS'ene.

`send-sms` er funskjonen som vil bli brukt til å sende SMS.

## CLOS

Den objektorienterte delen av Common Lisp kalles **CLOS** (som står for *Common Lisp Object System*). Jeg har blogget litt om dette før i [Template Method del 4: Multippel arv](http://blog.kjempekjekt.com/2012/02/02/template-method-del-4-multippel-arv/).

Her kommer definisjonen av `<gateway>`, som altså er en CLOS-klasse:

    (defclass <gateway> ()
      ((url :accessor gateway-url :initarg :url 
            :initform "https://xml.pswin.com/")
       (user :accessor gateway-user :initarg :user)
       (pw :accessor gateway-password :initarg :password)
       (sender :accessor gateway-sender :initarg :sender)))

Det du ser her er altså en enkel klasse med fire *slots* (variabler). For hver slot definierer jeg en *accessor*, som betyr at det genereres funksjoner for å lese og skrive til slotten. Jeg spesifiserer også *initarg*, som bestemmer navnet man må oppgi når man setter variablene under opprettelse en instansen.

For slotten `url` spesifiserer jeg også en default verdi *(initform)* med adressen til SMS-serveren jeg sansynligvis ønsker å bruke.

La oss nå lagre filen og teste den i REPL. Jeg starter [SBCL](http://www.sbcl.org/) fra kommandolinja i folderen hvor sms.lisp befinner seg, og det første jeg så må gjøre er å laste avhengighetene mine:

    (ql:quickload "drakma")
    (ql:quickload "cl-who")

Deretter kan jeg laste sms.lisp:

    (load "sms")

Om det gikk greit kan vi undersøke om vi har tilgang til `<gateway>` og hvordan den ser ut. Til det kan du bruke funksjonen `describe`. Evaluerer du `(describe 'sms:<gateway>)` får du ut en komplett beskrivelse av klassen.

Vi kan også opprette en instans av klassen og teste å sette for eksempel én av slot-verdiene:

    (defvar x (make-instance 'sms:<gateway> :user "tormar"))

`(describe x)` vil da gi oss info om instansen:

    #<SMS:<GATEWAY> {24EC7889}>
      [standard-object]
    
    Slots with :INSTANCE allocation:
      URL     = "https://xml.pswin.com/"
      USER    = "tormar"
      PW      = #<unbound slot>
      SENDER  = #<unbound slot>

## Generere XML

Ok, vi er nå tilbake i filen sms.lisp. Vi skal bruke cl-who til generere litt XML som skal sendes til SMS gatewayen. Og det er ganske enkelt egentlig, for lisp-strukturer ligner ganske mye på XML. Men først en liten detalj:

XML API'et jeg skal bruke er case sensitivt - elementene må være uppercase. Det overrasket meg egentlig litt, men da jeg brukte lowercase så virket det i alle fall ikke. Og ut av boksen produserer cl-who lowercase elementer. Derfor må jeg overstyre en innstilling, sånn:

    (setf cl-who:*downcase-tokens-p* nil)

Her setter jeg variabelen `*downcase-tokens-p*` til `nil`, som i Common Lisp har samme funksjon som `false` i de fleste andre språk. Og btw., boolske variabler og funksjoner som returnerer en bolsk verdi har som regel et navn som slutter på "-p". P står for predikat.

Det neste jeg skal gjøre er å definere en funksjon som genererer en XML-streng. Jeg kaller den `make-XML`, og den har tre parametre: et `<gateway>`-object, et mottakernummer og teksten som skal sendes:

    (defun make-XML (gateway rcv text)
      (with-html-output-to-string (s)
        (format s "<?xml version=\"1.0\"?>")
        (:SESSION
          (:CLIENT (str (gateway-user gateway)))
          (:PW (str (gateway-password gateway)))
          (:MSGLST
            (:MSG
              (:ID (str 1))
              (:SND (str (gateway-sender gateway)))
              (:RCV (str rcv))
              (:TEXT (esc text))))

Om du begynner å bli vandt til å se Lisp nå så er det ikke så vanskelig å se hva jeg gjør her. `with-html-output-to-string`, `str` og `esc` kommer fra cl-who. Sistnevnte brukes til å *escape* problematiske tegn i meldingsteksten.

Hvis vi går tilbake til REPL så kan vi nå teste denne funksjonen og se hva vi får ut. Vi kan for eksempel gjøre dette:

    (let ((conn (make-instance '<gateway> 
                               :user "tormar"
                               :password "secret"
                               :sender "tman")))
      (format t "~A" 
              (sms::make-XML conn
          	                 "4790696698" 
          	                 "test æøå <>&"))))

`make-XML` er ikke eksportert fra sms-pakken, og det er derfor jeg her aksesserer den med dobbelt-kolon: `sms::make-XML`.

Her er output (jeg har lagt til linjeskift og indentering):

    <?xml version="1.0"?>
    <SESSION>
      <CLIENT>tormar</CLIENT>
      <PW>secret</PW>
      <MSGLST>
        <MSG>
          <ID>1</ID>
          <SND>tman</SND>
          <RCV>4790696698</RCV>
          <TEXT>test &#xE6;&#xF8;&#xE5; &lt;&gt;&amp;</TEXT>
        </MSG>
      </MSGLST>
    </SESSION>

En liten detalj her er at jeg har lagret sms.lisp med ISO-8859-1 tegnkoding. Det blir mest riktig fordi det er det tegnsettet SMS-tjenesten forventer, og resultatet av `(enc text)` er avhengig av dette. Det er sikkert mange andre måter å gjøre det på, men det fungerte i alle fall for meg.

## HTTP Post

Da gjenstår det bare å lage en funksjon som genererer XML'en og sender den til serveren. Det er her Drakma og funksjonen `http-request` kommer inn i bildet.

    (defun send-sms (gateway rcv text)
      (http-request (gateway-url gateway)
                    :method :post
                    :content (make-XML gateway rcv text)
                    :content-type "text/xml charset=ISO-8859-1"))

Og da er vi egentlig ferdige, og vi kan sende den første SMSen fra REPL. I tillegg setter jeg en variabel som gjør at vi får se alle headerne som sendes og returneres.

    (setf drakma:*header-stream* *standard-output*)

    (let ((conn (make-instance '<gateway> 
                               :user "tormar"
                               :password "secret"
                               :sender "tman")))
      (format t "~A" 
              (sms:send-sms conn
          	                "4790696698" 
          	                "test æøå <>&"))))

Output:

    POST / HTTP/1.1
    Host: xml.pswin.com
    User-Agent: Drakma/2.0.2 (SBCL 1.3.0; Win32; 6.2.9200; http://weitz.de/drakma/)
    Accept: */*
    Connection: close
    Content-Type: text/xml charset=ISO-8859-1
    Content-Length: 216
    
    HTTP/1.1 200 OK
    Server: nginx
    Date: Tue, 17 Nov 2015 20:43:09 GMT
    Content-Type: text/xml
    Content-Length: 185
    Connection: close
    
    <?xml version="1.0"?>
    <SESSION><LOGON>OK</LOGON><REASON />
    <MSGLST><MSG><ID>1</ID><STATUS>OK</STATUS><INFO></INFO>
    <REF>bb2b4b5f-5cb6-4897-b49a-8f0e470e9faa</REF>
    </MSG></MSGLST></SESSION>

## Et tips til slutt

Da jeg implementerte denne SMS-pakken eksperimenterte jeg fortsatt endel med hvordan jeg utviklet og hvordan jeg underveis testet det jeg gjorde. Det jeg endte opp med var å lage to filer i tillegg til sms.lisp. Den ene kalte jeg sms-test.lisp, og den inneholdt en egen pakke med to funksjoner jeg kunne bruke til å teste sms.

Den filen så slik ut:

    (in-package :cl-user)
    (defpackage :sms-test
      (:use :cl :sms))
    (in-package :sms-test)
    
    (defun test-base (subject-f)
   	  (let ((conn (make-instance '<gateway> 
                                 :user "tormar"
                                 :password "secret"
                                 :sender "test")))
        (format t "~A" 
                (funcall subject-f conn 
                	               "4790696698" 
                	               "test æøå <>&"))))
    
    (defun test-xml ()
        (test-base #'sms::make-XML))
    
    (defun test ()
        (setf drakma:*header-stream* *standard-output*)
        (test-base #'send-sms))

Den andre filen kalte jeg load.lisp, og den inneholdt dette:

    (ql:quickload :drakma)
    (ql:quickload :cl-who)
    
    (load "sms")
    (load "sms-test")
    
    (format t "Test XML: Eval (sms-test::test-xml)~%")
    (format t "Send SMS: Eval (sms-test::test)~%~%")

Hvis jeg så startet Common Lisp med argument som sa at load.lisp skulle lastes, på denne måten...

    $ sbcl --load load.lisp

... så endte jeg enkelt opp i en REPL hvor alt var lastet og klart, og jeg kunne manuelt teste det jeg ville ved behov. 

Og sånn ble det 17 dager igjen til Jul!
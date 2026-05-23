---
title: "Common Lisp"
layout: post
link: http://blog.kjempekjekt.com/2015/12/04/common-lisp/
date: 2015-12-04T06:30:02.367Z
tags:
  - Julekalender
  - Common Lisp
  - Lisp
---

Lisp er en familie med programmeringsspråk, først skapt av John McCarthy rundt 1958. Lisp ble raskt populært i forskningsmiljøene, spesielt i de såkalte kunstig intelligens-laboratoriene, og ulike implementasjoner spredte seg fra universitet til universitet. 

På 80 og 90-tallet forsøkte man å forene Lisp-miljøene om én felles standard, og denne standarden fikk navnet **Common Lisp**. Det er skrevet og sagt mye om både hvor fantastisk og hvor anderledes Lisp er - [her på bloggen](http://blog.kjempekjekt.com/2010/07/08/er-lisp-bedre-enn-andre-programmeringssprket/), og [andre steder](http://www.paulgraham.com/avg.html) - så jeg skal begrense meg denne gangen. Denne artikkelen skal i stedet hjelpe deg i gang med det essensielle, og gi deg noen viktige råd og tips på veien.

![Alien technology](http://blog.kjempekjekt.com/uploads/2015/12/fb_banner.png)

##Men er ikke Common Lisp gammeldags?

Du tenker kanskje at noe så gammelt som Lisp ikke kan være like bra som de populære, nye språkene. Er det ikke Node.js alle skal utvikle i nå da? Er det i det hele tatt fortsatt noen som bruker Common Lisp? 

Ja, i høyeste grad! Lisp havner lett i skyggen av alt som er "poppis", men du finner språket i bruk de mest utrolige steder. Ta for eksempel dette sitatet fra [Luke Gorrie](https://twitter.com/lukego):

> I love hanging out with Lisp hackers: I find that we’re an unusually diverse community. How often do you attend a small conference where attendees are building nuclear defense systems, running intensive care wards, designing aeroplane engines, analysing Lute tablature, developing cancer drugs, writing FIFA’s legal contracts, and designing their own microchips?

##Mange implementasjoner

Common Lisp er som sagt en standard, og det finnes mange implementasjoner. Dette er uvandt, og kan være forvirrende og uoversiktelig. Jeg har erfaring med tre ulike implementasjoner, så la meg fortelle litt om dem.

**[GNU CLISP](http://www.clisp.org/)** var den første implementasjonen jeg prøvde. Den kjører blant annet på Linux, Mac OS X og Windows, og kan distribueres under GNU GPL. Min mening om CLISP er ikke kvalifisert, men jeg har inntrykk av at det er en fin nybegynner-implementasjon, og ikke den du velger for profesjonell utvikling. Den kompilerer til bytecode, ikke native, så den er ikke like rask som enkelte andre.

**[Steel Bank Common Lisp](http://www.sbcl.org/) (SBCL)** er den implementasjonen jeg bruker nå for tiden. Den er open source og skryter av **høy ytelse**. Den kjører best på Linux, mens Windows-støtten er eksperimentell (jeg har sålangt ikke støtt på noe problem med det).

**[Clozure Common Lisp](http://ccl.clozure.com/) (CCL)** er muligens et bedre valg på Windows. Kompilatoren er meget rask, og støtten for interop med C-bibloteker er god. Den har også støtte for å produsere selvstendige executables - noe jeg blant annet benytter meg av når jeg skal deploye en Common Lisp-løsning til Heroku (mer om det i en kommende post). Jeg har hørt at mange bruker SBCL i produksjon, men CCL til utvikling (pga. raskere kompilering).

[Se her for en grundig gjennomgang av mange implementasjoner](https://common-lisp.net/~dlw/LispSurvey.html).

##REPL og Image

La oss si at du velger å installere SBCL. Hva møter deg? Når du kjører SBCL fra kommandolinjen så kjører du opp et "image" - en *minnedump* - av et kjørende Common Lisp-miljø. Dette imaget har blitt gradvis bygget opp i løpet av en 20 års tid. Om du så velger å laste noe Lisp-kode så utvider det dette imaget.

Nå kan du velge; du kan bare avslutte SBCL, og neste gang du starter opp får det det samme imaget som du startet med første gang. Eller du kan lagre et nytt image som inneholder de endringene du har gjort. På denne måter utvider du din SBCL-installasjon. Eller du kan velge å definere en funksjon som "main", og så lagre imaget som et eksekverbart program.

Det vanligste er nok å ikke lagre noen endringer, og i stedet alltid laste koden din fra filer.

Når SBCL har startet kommer du inn i det vi kaller en **REPL** (Read-Eval-Print-Loop). Her kan du skrive kode som eksekveres direkte - *interaktiv programmering*. Det er vanlig å teste ting der, for så å lagre den ferdige koden i kildekodefiler.

Den vanligste editore blant Lispere er nok **[Emacs](https://www.gnu.org/software/emacs/)**. Når de jobber har de et Lisp image kjørende i bakgrunnen, og Emacs lar deg sende kodefragmenter til imaget for evaluering. Det er en noe bratt læringskurve for å komme i gang med dette, og det er ikke noe jeg bruker for tiden; jeg klarer meg med enten Vim eller Sublime Text, og en REPL ved siden av.

##Quicklisp

**[Quicklisp](https://www.quicklisp.org/beta/)** er navnet på verktøyet Lispere bruker for å laste ned og installere tredjeparts bibloteker, og tilsvarer for eksempel npm for node eller NuGet for C#.

For å ta det i bruk laster du ned en lisp-fil som du loader inn i Common Lisp. 

    $ curl -O https://beta.quicklisp.org/quicklisp.lisp
    $ sbcl --load quicklisp.lisp

Når SBCL har startet evaluerer du så:

    * (quicklisp-quickstart:install)

.. og du har nå det du trenger. Til slutt kan du evaluere:

    * (ql:add-to-init-file)

.. som gjør at du alltid har tilgang til quicklisp når du starter SBCL. Om du nå for eksempel vil laste ned og ta i bruk bibloteket [cl-redis](http://quickdocs.org/cl-redis/) - for å bruke Redis-databaser med Common Lisp - eksekverer du bare:

    * (ql:quickload :cl-redis)

Jeg kan nå koble meg opp mot min lokale Redis-server og teste litt:

    * (redis:connect :port 7777)
    * (red:ping)
    
    "PONG"

##Errors

En annen ting som må nevnes er hvordan exceptions fungerer i Common Lisp - for også det er ganske ulikt hva du er vandt til fra mere mainstream språk. Om noe går galt når du evaluerer noe kode så stopper alt opp, du får endel info om hva som gikk galt, og noen valgmuligheter (restarts). 

La oss for eksempel se hva som skjer om jeg deler et tall på 0:

    * (/ 1 0)

    debugger invoked on a DIVISION-BY-ZERO in thread
    #<THREAD "main thread" RUNNING {23F744D9}>:
      arithmetic error DIVISION-BY-ZERO signalled
    Operation was /, operands (1 0).
    
    Type HELP for debugger help, or (SB-EXT:EXIT) to exit from SBCL.
    
    restarts (invokable by number or by possibly-abbreviated name):
      0: [ABORT] Exit debugger, returning to top level.

I dette tilfellet fikk vi bare ett valg: Å avbryte den ulovelige delingen på 0.

Til å begynne med vil du nok ofte bli kastet inn i denne debuggeren. Det er ikke noe å frykte, det er bare en naturlig del av det interaktive miljøet. [Mer om dette her.](http://www.gigamonkeys.com/book/beyond-exception-handling-conditions-and-restarts.html)

##Kodeorganisering

Om du bare skal gjøre noe enkelt holder det å putte all koden din i én fil. Men om man skal være litt mere strukturert vil man definere en **pakke**. En pakke er i bunn og grunn et navnerom (namespace) - et objekt som inneholder ulike symboler (variabler, klasser, funksjoner, ..).

En vanlig konvensjon er at man har én pakke pr fil, og filen starter typisk med noe sånn som:

    (in-package :cl-user)
    (defpackage my-package-name
      (:use cl some-other-package)
      (:export #:some-function))
    (in-package :my-package-name) 

Den første linjen sørger for at vi befinner oss i pakken `cl-user`, som er default. Så definerer vi en ny pakke som vi i dette tilfellet kaller `my-package-name`. Vi deklarerer at vi internt i vår pakke skal bruke to andre pakker, nemlig `cl` (som er base-pakken i Common Lisp) og `some-other-package`. Vi deklarerer også at vi fra vår pakke skal eksportere et symbol `some-function`.

Deretter sier vi at vi er i den nye pakken vi har definert, og så kan vi begynne å implementere innholdet.., som da blant annet vil inkludere `some-function`.

Og så har vi noe som kalles **systemer**. For å definere et system bruker vi som regel et tool som ofte følger med Common Lisp og som heter **[ASDF](https://common-lisp.net/project/asdf/) (Another System Definition Facility). 

Det du typisk gjør er å lage en egen fil som bruker ASDF til å definere hvilke filer/pakker systemet ditt består av, hvilke avhengigheter det har, og hvordan det skal bygges.

Om vi bruker cl-redis som eksempel igjen, så kan vi ta en titt på det biblotekets systemdefinisjon, fra filen `cl-redis.asd`:

    (in-package :asdf)
    
    (defsystem #:cl-redis
      :version "2.3.8"
      :author "Vsevolod Dyomkin <vseloved@gmail.com>, Oleksandr Manzyuk <manzyuk@gmail.com>"
      :maintainer "Vsevolod Dyomkin <vseloved@gmail.com>"
      :licence "MIT"
      :description "A fast and robust Common Lisp client for Redis"
      :depends-on (#:rutils #:cl-ppcre #:usocket #:flexi-streams #:babel)
      :serial t
      :components ((:file "package")
                   (:file "float")
                   (:file "connection")
                   (:file "redis")
                   (:file "commands")))

Mer info om dette i [Packages, systems, modules, libraries - WTF?](http://weitz.de/packages.html)

##Læringsressurser

Den aller beste nybegynnerressursen for deg som ønsker å lære Common Lisp er kanskje boken *[Practical Common Lisp](http://www.gigamonkeys.com/book/)*, som er tilgjengelig online.

Ellers vil du også få behov for å lese API-dokumentasjonen på [The Common Lisp HyperSpec](http://www.lispworks.com/documentation/HyperSpec/Front/index.htm). Den er ikke så enkel å finne frem i, og dokumentasjonen forventer at du allerede har endel kunnskap. Da er det i starten kanskje enklere å forholde seg til en ressurs som [Simplified Common Lisp reference](http://www.jtra.cz/stuff/lisp/sclr/index.html).

For å finne informasjon om tredjeparts biblotek bruker du [quickdocs.org](http://quickdocs.org/), og [CLiki](http://www.cliki.net/) er en wiki med mye nyttig (men også endel utdatert) informasjon.

Det var det jeg hadde for i dag. Jeg håper disse postene om Common Lisp gjør deg mer interessert i språket, og kanskje gir deg lyst til å forsøke litt selv. For selv om det er litt "anderledes" så er det et kraftig språk med lang historikk, og det sies å være i bruk overraskende mange steder.

Og så var det 20 dager igjen til Jul! 
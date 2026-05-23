---
title: "Hvilken teksteditor bruker du?"
layout: post
link: http://blog.kjempekjekt.com/2014/03/02/hvilken-teksteditor-bruker-du/
date: 2014-03-02T00:02:45.992Z
tags:
  - Software/verktøy
---
Teksteditoren er et av programmererens viktigste verktøy. Bruker du en god editor som du behersker vil det gjøre deg mere produktiv. Det er ikke få timer man sitter og editerer kildekode i form av ren tekst. Derfor er det viktig at vektøyet du bruker er behagelig, jobber _med deg_ og ikke oppleves som en hindring.

Denne bloggposten dreier seg om de ulike valgene man har.

## Vi starter med Notepad
Siden tidenes morgen (nærmere bestemt 1985) har Windows blitt levert med den utskjelte teksteditoren Notepad. Den representerer det minimale man kan forvente av en editor, og har ingen ting av det man trenger for å programmere. Derfor dukket det etterhvert opp en rekke forbedringer..

En editor jeg brukte i flere år var [TextPad](http://www.textpad.com). Med den kunne man jobbe i flere dokument på en gang, den hadde flere editeringsmuligheter, og syntax highlighting. Faktisk brukte jeg TextPad da .NET var nytt og jeg startet å programmere C#. Visual Studio var for dyrt og ble vurdert som unødvendig av sjefen min den gangen.

Jeg vet ikke hvor smart dette egentlig var, men det gjorde i alle fall at jeg lært språket bra - ettersom jeg ikke fikk noe hjelp fra Visual Studios IntelliSense.

Andre populære editorer jeg plasserer i samme kategori som TextPad er [Notepad2](http://en.wikipedia.org/wiki/Notepad2) og [Notepad++](http://en.wikipedia.org/wiki/Notepad%2B%2B). Felles for disse editorene er at de gir deg mye av det du trenger som en utvikler, men de gir likevel langt fra en optimal opplevelse.

## Emacs
Teksteditering startet selvsagt ikke med Notepad - selv ikke for meg. Mine første kodelinjer (om vi ser bort fra Amiga-tiden) skrev jeg i [Emacs](http://en.wikipedia.org/wiki/Emacs) på UNIX. Den første Emacsen er faktisk like gammel som meg, og ble skrevet av Richard Stallman og Guy Steele.

Emacs er laget for å være ekstremt utvidbar. Den har sitt helt eget programmeringsspråk (Emacs Lisp), og med det kan man gjøre editoren om til nesten hva man måtte ønske. Emacs går så langt at det nesten blir en fullverdig [IDE](http://en.wikipedia.org/wiki/Integrated_development_environment).

![Editor learning curves](/uploads/2014/03/editor_learning_curve.jpg)

Jeg startet altså med Emacs, gikk over til Windows og brukte TextPad, og ble deretter indoktrinert til kun å bruke Visual Studio en periode. Men etterhvert som jeg begynte å _lukte_ på andre språk savnet jeg den gode editor-opplevelsen. Jeg gikk derimot ikke tilbake til Emacs...

## Vim
*Vi* var en av de vanligste editor på UNIX-systemer, og er like gammel som Emacs. _Vim_ er en forbedret utgave som dukket opp i 1991. Den er ganske utvidbar, men kanskje ikke i samme utstrekning som Emacs. Derimot er den optimalisert for utviklereffektivitet - du skal kunne gjøre det aller meste med kun noen få tastetrykk, og uten å bevege fingrene fra "startrekka" på tastaturet.

Vim bruker også et sett med ulike _modi_ (moduser?) som nybegynnere synes er veldig rart, men som gjør denne effektivitetsoptimaliseringen jeg snakket om mulig.

Det var altså Vim jeg valgte som min nye _go-to_ editor, og det er Vim jeg skriver denne artikkelen i. Noe av det jeg liker med Vim er at den starter raskt, bruker lite ressurser, og finnes (eller er lett å installere) over alt. Men jeg skulle gjerne hatt muligheten til å hacke editoren med Lisp, så jeg er litt misunnelig på Emacs-gjengen.

![Kakediagram popularitet](/uploads/2014/03/editor_popularitet.png)

## Hellig krig
Det har vært mye rivalisering mellom utviklere opp gjennom årene, og [krigen mellom Emacs- og Vim-brukerne](http://en.wikipedia.org/wiki/Editor_war) er en av de virkelig store. Og man _må_ nesten velge én også; for å kunne bruke editoren effektivt må man lære seg et sett med tastekombinasjoner, og å beherske begge blir rett og slett for vanskelig.

For dem som står på utsiden og bruker et IDE (og kun den enkleste av teksteditorene når de skal gjøre noe annet), fortoner det hele seg ganske merkelig.

## TextMate og Sublime
For noen år siden begynte plutselig Mac å bli veldig populært - også blant utviklere uten genser med lang hals. Da (fra 2004 og oppover) var det én teksteditor alle snakket om, og det var [TextMate](http://en.wikipedia.org/wiki/Textmate). Den skiller seg fra de fleste andre jeg har snakket om på to punkter: 1) Den var kun tilgjengelig på ett operativsystem, og 2) den var ikke gratis.

Jeg har ikke førstehånds erfaring, men slik jeg oppfatter det representerte TextMate en ny vind for teksteditorer. Den tok noe av styrken til Emacs og Vim, men gjorde det mere moderne og enklere tilgjengelig.

Og så dukket [Sublime Text](http://en.wikipedia.org/wiki/Sublime_Text) opp i 2008. Denne editoren er også propreitær software man "må" betale for, men den er tilgjengelig på både Linux, Mac OS og Windows. Og i tillegg til alle styrkene til TextMate kan den scriptes med Python.

Det virker som om Sublime Text er en av de aller mest populære av det jeg vil kalle de "moderne" teksteditorene.

## Light Table
En annen editor jeg har lyst til å trekke frem ble lansert i 2012 av [Christ Granger](https://twitter.com/ibdknox). Den heter [Light Table](http://www.chris-granger.com/lighttable/), og representerer et nytt steg i utviklingen av programmeirngsverktøy.

(Light Table er derimot ikke akkurat en _general purpose_ editor, men et IDE for Clojure, JavaScript/HTML/CSS og Python.)

Pitchen er at det er en editor som lar deg modifisere kjørende programmer, og gir deg løpende feedback som lar deg forstå koden din bedre. Hvis du så Bret Victor sitt [Inventing on Principle](http://worrydream.com/#!/InventingOnPrinciple)-foredrag så skjønner du hva jeg mener.

Det er spennende å følge med på hvordan denne editoren utvikler seg, og å se om ideen i praksis kan gjøre oss til bedre utviklere.

## Github kommer på banen
Og så skjedde det noe som jeg synes er veldig spennende, og som er grunnen til at jeg i det hele tatt ble inspirert til å skrive denne laaaaange bloggposten om teksteditorer. Github har nemlig bestemt seg for å lage sin egen editor. Den ble annonsert i forrige uke, og heter [Atom](https://atom.io/).

![Atom, under the hood](/uploads/2014/03/under-the-hood.gif)

Den ser nesten ut som en klone av Sublime Text. Men mens Sublime og TextMate tilbyr enkelhet og bare begrenset utvidbarhet, og Emacs og Vim tilbyr ekstrem fleksibilitet men med en høy læringskurve, så lover Github-folkene at Atom skal bli noe mer:

> "We think we can do better. Our goal is a zero-compromise combination of hackability and usability: an editor that will be welcoming to an elementary school student on their first day learning to code, but also a tool they won't outgrow as they develop into seasoned hackers."

Atom er laget i Node, og tilbyr utvidbarhet via JavaScript/CoffeeScript, HTML og CSS. Den har fått gedigen oppmerksomhet allerede, og jeg tror dette kan bli Veldig Bra! Det er veldig smart å bygge en editor på så allmenn teknologi, og jeg tror det raskt vil dukke opp en rekke utvidelser til Atom.

Det vil for eksempel ikke gå lang tid ([hevder flere enn meg](http://dylanfoundry.org/2014/02/28/early-thoughts-on-atom/)) før vi ser Light Table-lignende funksjonalitet i Atom.

Jeg har meldt meg på beta-programmet, men må desverre smøre meg med tolmodighet siden den foreløpig kun er tilgjengelig for Mac-brukere (Linux og Windows kommer).

## Nå lurer jeg veldig på hva du mener!
Jeg er opptatt av editoren min. Og jeg mener at det er viktig å være det - akkurat som det er viktig for gitaristen å kjenne sin gitar eller yrkessjåføren å forstå seg på sin bil.

Men hva mener du? Hva ser du etter i en teksteditor? Hva savner du, hva kan du ikke klare deg uten? Er det kanskje ikke så viktig eller interessant som jeg skal ha det til? Det hadde vært veldig kjekt å høre fra deg som har litt annen erfaring enn min egen.

Jeg håper du legger igjen en kommentar!

---
title: "10 verktøy jeg ikke hadde brukt for et år siden"
layout: post
link: http://blog.kjempekjekt.com/2015/02/08/10-verktoy/
date: 2015-02-08T20:58:21.699Z
tags:
  - Software/verktøy
---
Jeg liker bloggposter hvor utviklere forteller om hvilke verktøy de bruker. Som regel plukker jeg opp et eller annet som ikke hadde vært på radaren min, og som jeg kan begynne å bruke selv.

I denne posten forteller jeg om 10 verktøy som jeg ikke hadde brukt for ett år siden, men som jeg nå har hatt positive erfaringer med. Jeg håper det kan være ett og annet tips her, og at jeg kan inspirere deg til å prøve ut noe du ikke har sett på før.

La oss hoppe i det..

### Zed: Rethinking Code Editing

[Zed](http://zedapp.org/) er en *anderledes* teksteditor! Jeg er veldig glad i Vim, og jeg bruker SublimeText, men editoren jeg brukte mest i 2014 - og som jeg for eksempel har redigert de fleste bloggpostene med - var faktisk Zed.

![Zed](http://blog.kjempekjekt.com/uploads/2015/02/zed.png)

Zed har all den funksjonaliteten du skal forvente av en editor for "power users": Syntax-støtte for de fleste språk, snippets, innebygd *linting*, multiple cursors, split-view, themes, remote editering osv. Den er open source, og kan konfigureres og utvides med HTML, JavaScript og CSS. 

Men grunnen til at jeg bruker Zed er at den **gjør ting enklere** enn andre editorer. Når jeg koder i Zed bruker jeg rett og slett mindre hjernekapasitet på å håndtere selve verktøyet, og kan konsentrere meg bedre om koden og oppgaven som skal løses. Dette er ikke lett å forklare - kanskje det rett og slett må oppleves - men du kan lese [mer om Zeds visjon og egenskaper her](http://zedapp.org/vision/).

Største ulempe: Jeg har begynt å glemme å lagre endringer i andre editorer, fordi Zed kontinuerlig lagrer alt jeg gjør :)

### Backbone: Webløsninger med ryggrad

![Backbone](http://blog.kjempekjekt.com/uploads/2015/02/backbone.png)

[Backbone.js](http://backbonejs.org/) er langt i fra et nytt verktøy - du har sikkert brukt det for lenge siden - og er ikke det front-end verktøyet folk snakker mest om for tiden. Men da jeg skulle gjøre et nytt webprosjekt i høst valgte jeg likevel Backbone..

.. og det jeg liker med det er at det ikke går i veien for meg, og ikke har så mye magi. Jeg ble fullstendig solgt av følgende utsagn:

> "Philosophically, Backbone is an attempt to discover the minimal set of data-structuring (models and collections) and user interface (views and URLs) primitives that are generally useful when building web applications with JavaScript. In an ecosystem where overarching, decides-everything-for-you frameworks are commonplace, and many libraries require your site to be reorganized to suit their look, feel, and default behavior — Backbone should continue to be a tool that gives you the freedom to design the full experience of your web application."

Jeg er ikke en stor *Knockout-fan*, noen *Angularianer* eller *Emberista*. Om jeg først og fremst var en front-end utvikler, og investerte mer tid til å lære meg noe skikkelig, hadde holdningen min kanskje vært anderledes. Men for meg var Backbone en svært positiv opplevelse, og noe jeg har lyst til å bruke mer. At man med fordel kan bruke [React](http://facebook.github.io/react/) til å lage views i Backbone synes jeg også virker spennende. 

### Pure.css

De siste årene har jeg basert ALLE webløsninene jeg har gjort på [Twitter Bootstrap](http://getbootstrap.com/). Designet på denne bloggen er bare *ett* eksempel. Men av og til merker jeg at bootstrap legger litt for mye føringer, og ikke er så fleksibelt som man skulle ønske seg.

Derfor googlet jeg litt, og fant [Pure](http://purecss.io/) som virket lovende. Pure er et sett av små, responsive CSS-moduler som gir deg et bra grunnlag til å gjøre ditt eget webdesign. Modulene bygger på [Normalize.css](http://necolas.github.com/normalize.css/), som gir optimal cross-browser-støtte for HTML5. Pure har et fleksibelt grid-system, og stiler for forms, knapper, tabeller og menyer. Bootstrap har mye mer, men Pure er enklere, mere fleksibelt, og laster mye raskere.

Som bonus-verktøy #1 vil jeg nevne [Font Awesome](http://fortawesome.github.io/Font-Awesome/) som gir deg den samme glyph-funksjonaliteten du har i Bootstrap, bare med bedre og flere ikoner.

Bonus-verktøy #2 er [YUI Skin Builder](http://yui.github.io/skinbuilder/?mode=pure), hvor du kan lage custom CSS skins du kan bruke sammen med Pure.

### Vagrant: Development environments made easy

![Vagrant](http://blog.kjempekjekt.com/uploads/2015/02/vagrant.jpg)

[Vagrant](https://www.vagrantup.com/) er et verktøy for utviklere. Det lar deg scripte (automatisere) oppsettet av VM'er som du kan bruke når du utvikler. Kanskje du trenger tilgang til MongoDB og RabbitMQ? Med en vagrant-fil i git-repositoriet kan en hvilken som helst utvikler fyre opp to nye Linux-VM'er som kjører de to produktene kun ved å kjøre *én* enkel kommando.

Jeg bruker blant annet vagrant til å skape et stabilt miljø for bloggen min. Programmeringsbloggens utviklingsmiljø (som vagrant kjører opp ved hjelp av VirtualBox) er en Ubuntu-VM med node.js, grunt og lighttpd. Veldig nyttig og enkelt.

Merk at vagrant *ikke* er et verktøy for provisjonering av produksjonsservere, kun VM'er ment for utvikling. Men samme provisjoneringsskript, skrevet for eksempel i [puppet](http://puppetlabs.com/puppet/what-is-puppet), kan benyttes av både vagrant og til produksjonsetting.  

### lighttpd: Fly Light!

[lighttpd](http://www.lighttpd.net/) (uttales *lighty*) er en lynrask webserver som bruker lite ressurser. lighttpd er open source, brukes blant annet av Wikipedia og YouTube (i alle fall ifølge en kilde fra 2008 (: ), og kan sammenligned med den kanskje noe mer kjente Nginx.

Denne bloggen min serves av Apache, men når jeg jobber med den lokalt så tester jeg med lighttpd, som er kjent som en bedre host av statiske filer.

### localtunnel: Expose yourself to the world!

[localtunnel](http://localtunnel.me/) er et lite kommandolinjeverktøy (node.js-modul faktisk) som lar deg dele ut tilgang til webtjenester/sider på din lokale utviklingsmaskin, uten å måtte trikse med DNS eller brannmurinnstillinger. Med en enkel kommando kan du få opprettet en unik, temporær URL som vil fungere som en proxy og sende alle requests til den lokale maskinen. Ideelt når man sitter og jobber med noe kun lokalt, men så ønsker at noen andre skal teste ut løsningen. 

Jeg har brukt andre slike tunneller tidligere, men ingen har vært så enkel i bruk og så stabil som localtunnel. All trafikk går over trygg ssl, og løsningen krever ingen registrering eller betaling. Perfekt sålenge du har node.js på maksinen.

### CrunchBang

![CrunchBang](http://blog.kjempekjekt.com/uploads/2015/02/crunchbang.jpg)

[CrunchBang](http://crunchbang.org/) er en Debian-basert Linux distribusjon som ser bra ut, har høy ytelse, bruker lite ressurser, og er enkel å forholde seg til og å konfigurere. Jeg kjører den i VirtualBox under Windows, og bruker den til alt mulig. Tidligere har jeg kjørt en Ubuntu VM som "hobby-plattform", men nå foretrekker jeg CrunchBang. 

### MonoDevelop

![MonoDevelop](http://blog.kjempekjekt.com/uploads/2015/02/monodevelop.jpg)

[MonoDevelop](http://www.monodevelop.com/) er en cross-platform IDE for blant annet C# og F#. Jeg har såvidt begynt å bruke den på Linux, men førsteinntrykket er ikke så verst. Det er ikke Visual Studio selvfølgelig, men det virker som om man har det meste man trenger. Solutionfiler og prosjektfiler fra VS er kompatible med MonoDevelop, NuGet fungerer osv. Det siste jeg brukte den til var å teste at [FsPrettyTable](http://blog.kjempekjekt.com/2015/01/31/fsprettytable/) fungerte som det skulle i mono på linux.

### Robomongo

![Robomongo](http://blog.kjempekjekt.com/uploads/2015/02/robomongo.jpg)

Jeg er en ivrig bruker av mongoDB. Da er det greit å ha et godt verktøy for å studere databasene, kjøre diverse spørringer og slike ting. Det siste året har [Robomongo](http://robomongo.org/) vært det prefererte verktøyet. Robomongo er som et grafisk grensesnitt på toppen av mongo shell, og det synes jeg fungerer veldig bra.

### mongoDB MMS

![MMS](http://blog.kjempekjekt.com/uploads/2015/02/mms.jpg)

Siste verktøy på listen er [MMS](https://mms.mongodb.com/), et online verktøy fra mongoDB for administrering og overvåking av mongo-servere. Vi bruker monitoreringsdelen av MMS, som gir et viktig innblikk i hvordan det står til med databasene våre.
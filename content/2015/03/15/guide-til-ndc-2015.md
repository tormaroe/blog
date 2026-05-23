---
title: "Guide til agendaen, NDC 2015"
layout: post
link: http://blog.kjempekjekt.com/2015/03/15/guide-til-ndc-2015/
date: 2015-03-15T13:52:08.059Z
tags:
  - NDC
---
![Agendaen blir til](/uploads/2015/03/agenda.jpg)

Agendaen til **NDC Oslo 2015** er publisert. Å si at den er omfattende er en underdrivelse! Ni parallelle rom over tre dager gir totalt over 170 forelesninger.

Men langt flere forelesninger og forelesere nådde *ikke* opp. Den tøffe utvelgelsen ble i år gjort av [Niall Merrigan](https://twitter.com/nmerrigan) (Capgemini), [Liam Westley](https://twitter.com/westleyl) (Huddle), [Torstein Bjørnstad](https://twitter.com/toshb) (Webstep) og meg, samt Jacob Bradford og Kjersti Sandberg fra ProgramUtvikling. I tillegg har [Olve Maudal](https://twitter.com/olvemaudal) (Cisco) hatt ansvaret for sporene om C++, embedded og IoT, og [Bryan Hunter](https://twitter.com/bryan_hunter) (Firefly Logic) har i år som i fjor hatt ansvar for sporet om funksjonell programmering. [Svein Arne Achenhausen](https://twitter.com/ackenpacken), [Bodil Stokke](https://twitter.com/bodil) og [Perti Wilhelmsen](https://twitter.com/petriw) har også vært involvert, og da håper jeg at jeg ikke glemte noen..

## 14 virtuelle spor

Under planleggingen hadde vi fjorten ulike tema vi forsøkte å gruppere forelesningene under. I et forsøk på å gi deg bedre innblikk i den svære agendaen tar jeg utgangspunkt i disse fjorten, og forsøker å si noe fornuftig om hva du vil kunne få med deg fra hver av dem.

Men obs, obs - vær oppmerksom på at det bruker å bli endel endringer i programmet - spesielt hvor og når de ulike foredragene finner setd - så følg med..

### 1. Arkitektur og design

Sporet om softwarearkitektur og design er sterkere enn på lenge, og det gjør at jeg gleder meg ekstra mye til NDC i år. De fleste forelesningene i kategorien gjennomføres i rom 2, og sporet strekker seg over alle tre dagene. Blant de mest profilerte speakerne finner vi navn som Udi Dahan, Greg Young, Jimmy Bogard, og Neal Ford.

**Microservices** er et *hot* tema, og flere vil snakke om dette. Spesielt interessant blir det kanskje når Dennis van der Stelt vil diskutere om man skal duplisere eller replikere data i Microservices.

**Actor model** er et annet tema, som vil bli diskutert både her (i form av **Orleans** fra Microsoft Research) og på den funksjonelle sporet.

Og så blir det noe **REST**, **CQRS**, og **event sourcing**. Jeg regner dessuten med at det som vanlig blir endel snakk om **nServiceBus**, men for å skape litt balanse er jeg glad for at vi også har inkludert en talk om løst koblede systemer med **MassTransit** og **RabbitMQ**.

En skikkelig rosin i pølsen kommer fra Trond Arve Wasskog, CTO i Bekk Consulting. I foredraget **595 billions income - untouched by human hands** vil han fortelle om moderniseringen av løsningene for å kreve inn skatten vår i Norge. Her blir det avslørt hvordan Microservices, REST, event processing, idemotency og flere ting blir brukt for å sørge for at løsningene skalerer og automatisk håndterer feilsituasjoner.

Og i siste slot på fredagen finner vi sesjonen **What business software developers can learn from game developers**, som omhandler ting som data-oritented programming, behavior trees, tilstandsmaskiner, event loops, og hvordan man kan lære brukeren hvordan han skal bruke systemet underveis. 

### 2. DevOps

DevOps - *"riktig"* samhandling mellom utvikling og drift - har blitt et hett tema de siste årene, og i år vil du finne mange foredrag om dette i rom 1 på torsdagen og fredagen. Noen sentrale stikkord er **Automation**, **Continuous Delivery** og **Docker**. Det blir et foredrag fra Paul Stack om å skalere logging (til milliarder av requests pr dag), foredrag om monitorering, og om å måle og agere på ytelsesindikatorer.

Sam Newman starter det hele med å snakke om **Microservices**, og hvordan det er en strategi for god Continuous Delivery (tror jeg). Jon Arild Tørresdal følger opp med å presentere **The State of DevOps in Windows Land**.

Ellers kan det være nyttig å få med seg Alex Yates fra Red Gates, som vil snakke om Continuous Delivery av databaser, noe som mange synes er utfordrende. Og til slutt kan du se hvordan du kan DevOps'e dit eget utviklingsmiljø på Windows med **Chocolatey** og **Vagrant**.

### 3. Skyen

Cloud-sporet finner du i rom 7 på fredagen. Det starter med en sammenligning og vurdering av **Amazon Web Services** (AWS) og **Azure**. Deretter vil vi lære om **Azure Web Jobs**, et nytt tilbud i Microsofts sky. I tredje sesjon vil vi få innblikk i lærdommer fra å teste ulike NoSQL-databaser i AWS; hvordan man reduserer flaskehalser i nettverkstraffikk, diskbruk, CPU or RAM. Databasene som blir brukt her er AerospikeDB og Redis.

Harald Schult Ulriksen kommer med et veldig spennende, erfaringsbasert foredrag om hvordan **NRK** har brukt Azure til å utvikle tv.nrk.no. Harald vil blant annet snakke om bruk av køer, Table Storage, DocumentDB, Elasticsearch, Redis, geo-replikering mellom datasentre, *command query separation*, og tjenestetilgjengelighet.

Matthew Podwysocki fra **Reactive Extensions**-teamet returnerer i år med hele tre foredrag. Som en del av Cloud-sporet vil han snakke om **Cloud-Scale Event Processing** med Reactive Extensions. Fredagen avsluttes så med en presentasjon av **Microsoft Azure Cache**, som faktisk viser seg å være Redis. 

### 4. Databaser og søk

Dette sporet foregår i hovedsak i rom 1 på onsdagen, men du finner selvsagt relaterte sesjoner andre steder også.

Er du interessert i tekstsøk kan du starte onsdagen med en grundig introduksjon til temaet fra Toby Henderson. Deretter vil Itamar Syn-Hershko dykke ned i utfordringene rundt *flerspråklig søk*, hvor han benytter **ElasticSearch** og **Lucene**.

Itamar vil dessuten i et annet foredrag gi oss en guide til **BigData**-teknologier, og generelt fortelle om hvilke utfordringer man må forholde seg til - og hvordan man løser dem - når man må jobbe med enorme datamengder.

Er du interessert i et bedre innsyn i **NoSQL** - og om det er noe du bør bry dem om - bør du få med deg forelesningen til David Ostrovsky, som er senior løsningsarkitekt hos Couchbase. Robert Friberg vil gjøre en sammenligning av tre ulike databaser som holder alt i minnet: **OrigoDB**, **Redis** og **SQL Server Hekaton**. Og har du behov for graph-databaser blir det også en sesjon om **Neo4j**.

Og venter du helt til fredagen vil du så kunne få se en praktisk demonstrasjon av ElasticSearch og Kibana, når Christoffer Vig analyserer øl-data fra Vinmonopolet. Regner med det vil sitte flere med tømmermenn i salen, og at dette kan bli underholdende.

### 5. Sikkerhet

Dem som er glad i sikkerhet vil også finne mye bra innhold på NDC i år. Sporet kjøres på rom 5 på torsdag og fredag. Foreleserne inkluderer blant andre Troy Hunt, Dominick Baier, Brock Allen og John McCoy, men det største navnet i år er visstnok **[Bruce Schneier](http://en.wikipedia.org/wiki/Bruce_Schneier)**.

Personlig synes jeg normalt ikke sikkerhetstemaet er så veldig sexy (selv om det selvsagt er viktig), men det er likevel noen ting her jeg skulle kunne deltatt på, som for eksempel..

.. å lære å *hacke* .NET, og hvordan man forsvarer seg mot det, fra John McCoy.

.. å lære alt jeg behøver å vite om HTTP security headers fra André N. Klingsheim, som tidligere jobbet med sikkerhet hos Skandiabanken.

.. å få innblikk i verktøy for å bryte gjennom sikkerhetsbarriærer fra Niall Merrigan.

Like før festen på torsdagen blir det også en keynote om sikkerhet, men med en litt muntrere tone, fra [Galactic Viceroy of Research Excellence](http://news.microsoft.com/stories/people/james-mickens.html) at Microsoft Research - **James Mickens**. Vi forventer god underholdning.

Sikkerhets-sporet avsluttes med en paneldebatt (sansynligvis **.NET Rocks!**) hvor Bruce Schneier, Klingsheim, Barry Dorrans (ASP.NET security czar at Microsoft), Troy Hunt og Merrigan vil delta. Bør kunne bli underholdende det også.

### 6. Webutvikling

Dette er kanskje den største kategorien. En viktig bit av det er **JavaScript**, og det vil bli gode anledninger til å få med seg hva som kommer i **ES6**. Flere vil også snakke om testing av JavaScript.

Og blant de konkrete teknologiene du vil få høre om finner vi for eksempel **Aurelia**, **ReactJS**, **Meteor** og **AngularJS**.

Blant de mange spennende profilene på web-tracket finner du **Rob Eisenberg**, som blant annet står bak Durandal, og som har jobbet på Angular 2.0 teamet. Du vil kunne få med deg Mark Rendle (Simple.Data not-an-ORM og Simple.Web), Darrel Miller fra Runscope, og mange andre.

### 7. UX

User Experience er tradisjonelt ikke noe NDC har vært veldig tunge på, men vi har funnet noen spennende talks om temaet til årets konferanse. Disse er samlet i rom 5 på onsdagen.

Liam Westley vil snakke om generelle designprinsipper i **"Don't Make Me Feel Stupid"**. I foredraget **Why developers are the new designers** blir det diskutert hvilket forhold utviklere bør ha til UX design, og hvilken minimumskunnskap de bør ha om det.

På slutten av dagen får vi et foredrag om å utvikle websider og apper som er *tilgjengelige* for alle dem som har spesielle utfordringer.

Det blir også noen foredrag om **CSS** og **Sass**.

### 8. Mobil

Mobil-innholdet på NDC i år finner du først og fremst i rom 3 på fredagen. Du vil kunne lære om å designe SDK'er for Android. Du vil lære om å utvikle *native* apps for iOS, Android og Windows Phone med én kodebase i C# - ved hjelp av **Xamarin.Forms**. Du vil få innblikk i hvordan man kan lage 2D-spill som kjører over alt med C# og **CocosSharp** (også Xamarin). Og du vil få en introduksjon til det Microsoft har kalt **Universal Windows Apps** (apps for alle devicer).

Det blir også en sesjon om **Swift** - Apples nye programmeringsspråk - samt et foredrag om hvordan man benytter annonser i spill og mobile apper.

Om vi hopper over til torsdagen, og rom 2, så finner du også en spennende forelesning om hvordan du løser datakonflikter når du har mobile apps som bare er online av og til. Dette har mer med generell arkitektur og design å gjøre enn mobilutvikling, men jeg tenkte det burde nevnes.

Det må innrømmes at det ikke er *mye* mobilt innhold på konferansen i år, men vi føler vi har plukket ut noen ting som kan være interessante og verdifulle for mange.

### 9. C# og .NET

Diverse tema fra .NET-rammeverket vil man finne i rom 3 på onsdagen og torsdagen. Det kommer flere profilerte utviklere fra Microsoft, og du vil få høre om **.NET og Visual Studio 2015**, **ASP.NET 5**, **MVC 6** og **.NETCore**. Hvis du har lyst til å kjøre ASP.NET på **Linux** så vil du finne en sesjon om det også.

Noen foredrag som folk bør merke seg er...

.. I **Making .NET Applications Faster** vil du få en rekke praktiske tips til hvordan du kan tyne mer ytelse ut av .NET-løsningene dine.

.. Scott Allen vil vise frem noen utvalgte kodeperler fra kildekoden til .NET og Roslyn.

.. Venkat Subramaniam vil demonstrere **immutability** i C# og F# (for dem som ikke føler seg helt klar til å delta på den funksjonelle sporet, men som er interessert likevel).

### 10. Funksjonell programmering

FP-sporet befinner seg i rom 9, og går over alle tre dagene. Språkene det fokuseres på er **Erlang**, **Elixir** og **F#**, men det blir også et møte med **Haskell**. Alle detaljene ser ikke ut til å være på plass ennå, men det blir garantert mye bra her. Bryan Hunter gjør en god jobb med å forme FP-sporet, og stemningen er alltid god på de forelesningene.

Et av de foredragene jeg (som en språk-nerd) er mest spent på er Yan Cui sitt **A tour of the language landscape**, hvor Yan vil trekke frem hva han har lært fra ulike språk.

### 11. C++

I fjor hadde NDC et spor med C++, og det var en suksess. I år blir to hele dager med C++ på konferansen: Onsdag og torsdag i rom 8. Jeg vet ikke mye om hverken temaet eller så mange av foreleserne, men et par ting stikker seg frem...

.. Mark Isaacson fra Facebook vil holde et foredrag han kaller **The Set of Natural Code**. Han vil snakke om hvordan språkene våre utvikler seg. Han vil bruke C++ og D, men forkunnskap i disse språkene er ikke nødvendig for å kunne henge med.

.. Kevlin Henney, som er en inspirerende foreleser, vil kombinere C++ og funksjonell programmering.

### 12. Embedded og Internet of Things

Jeg har ikke så mye å si om dette, annet enn at NDC i år forsøker å inkludere mer av disse temaene fordi vi tror det er spennende og viktige områder som utviklere generelt er interesserte i å lære mer om. Alt var ikke på plass da agendaen ble publisert, så følg med - her kan det dukke opp flere interessante tema.

### 13. Softskills

Softwareutvikling dreier seg ikke bare om teknologi. *People over process* vet du! I rom 6 finner du en rekke foredrag om hvordan vi bør jobbe sammen som utviklere.

Fallgruver ved smidig utvikling, data driven project management, kreativitet, motivasjon og teambuilding er noe stikkord. Du vil finne sesjoner om kontroversielle tema som **No Estimates** og **Mob Programming**, og selveste **Andy Hunt** - den pragmatiske programmereren - kommer for å holde to foredrag.

Et par godbiter...

.. Adam Ralph var den første utenfor Microsoft som fikk en pull request akseptert i .NET core, og han vil fortelle om hvordan *open source* fungerer, og hvordan *du* kan bidra!

.. Patroklos Papapetrou skriver for tide på boken *"The Art of Software Gardening"*, og han kommer for å snakke om essensielle ferdigheter, riktig innstilling, og nyttige praksiser moderne utviklere bør besitte.

### 14. Gøy

NDC må alltid krydres med noen sesjoner som kanskje ikke alltid passer tematisk helt inn, men som potensielt er svært underholdende. I år trekke vi frem..

.. Felix Gorbatsevich, som vil vise oss hvordan han har laget 3D-simulatorer for olje- og gass-industrien.

.. Gary Short, som vil **jakte på troll** på internett. 

.. Mark Rendle, som holder en presentasjon har har kalt **Everything I Know About Computers, I Learned From the Movies**. Her er abstractet:

> Hooray for Hollywood! Nothing has done more to educate the public about technology and computers than the silver screen. Come on a ride down the boulevard of dreams, where you can learn how hackers hack; why artificial intelligence wants to kill us all; and what happens when a self-replicating trojan virus worm breaks through a 256-bit firewall. 

.. David Ed Mellum vil stå på scenen og **bygge en ny browser** med CSS, HTML og Node.js.

Og for oss språk-nerder blir det et gjensyn med IL-magikeren Philip Laureano. Han vil presentere 10 enkle regler for å lage ens egen kompilator på CLR'en.

OG HELT TIL SLUTT: Det blir også et par sesjoner med lyntaler, for dem som liker det formatet.

## Lenker

Den fulle [agendaen finner du her](http://ndcoslo.oktaset.com/agenda), og oversikt over [alle speakerne ser du på denne siden](http://www.ndcoslo.com/ndc_speakers).

Vi snakkes i Oslo!
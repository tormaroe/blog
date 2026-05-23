---
title: "May<T>"
layout: post
link: http://blog.kjempekjekt.com/2015/12/03/may-of-t/
date: 2015-12-03T06:43:07.474Z
tags:
  - C#
  - Funksjonell programmering
  - Julekalender
---

I noen programmeringsspråk, typisk i de statisk typede funksjonelle språkene, finner du noe man kaller **option type** (også kalt *maybe type*). Dette er typer som representerer en "valgfri" verdi, og brukes som returtypen til funksjoner som enten returnerer en verdi eller som *ikke* returnerer en verdi. I stedet for at en funksjon returnerer en `User` vil den enten returnere `Some User` eller `None`.

Her om dagen fikk jeg lyst på en slik datatype i C#. Jeg begynte først å implementere en selv, men så kom jeg på at jeg kanskje burde undersøke om dette var et hjul som var funnet opp før. Og det var det. 

[Craig Gidney](http://algorithmicassertions.com/), som er ansatt hos Google, har nemlig laget .NET-bibloteket **[May](https://github.com/Strilanc/May)**. Men før jeg viser litt av hva som er så bra med option type, la oss snakke litt om *null*. 

##Null og Nullable<T>

I språk som C# har vi alltid hatt *null*. Den verdien kan du jo bruke til å representere "ingen verdi". I alle fall som regel (men hva gjør du om du skal hente første verdi fra en liste, og første verdien faktisk er *null*?).

Hovedproblemet med *null* er derimot at det er en så _ubrukelig_ verdi. Altså: Med en gang du prøver å bruke den så tryner alt, og du må værsågod håndtere en *NullReferenceException*. Ikke går det an for en metode å si at *"jeg kommer aldri til å returnere null"* heller. Strengt tatt bør all kode som skal bruke et objekt sjekke at det ikke er *null* først, og det er slitsomt, lett å glemme, og resulterer i at den interessante koden drukner i `if (someObject != null)`.

Og så er det ikke alle verdier som kan være *null* heller da. Derfor fikk vi `Nullable<T>`, som gjør det mulig å representere at en *value type* (int, bool osv.) er *null*. Dette er et stykke på vei mot *option type*, men mangler mye av det som gjør *option types* bra i språk som Haskell og F#.

##La oss teste May

Det er alltid litt vanskelig å komme opp med realistiske kodeeksempler, men tenk deg at vi har en metode som gir deg nyeste filen i en folder, gitt at filen er endret i dag: 

    public FileInfo GetNewestFileToday(string folder)
    {
        return Directory.GetFiles(folder)
            .Select(f => new FileInfo(f))
            .Where(fi => fi.LastWriteTime > DateTime.Today)
            .OrderByDescending(fi => fi.LastWriteTime)
            .FirstOrDefault();
    }

Denne metoden er fin å bruke sålenge det finnes noen filer i folderen som er endret i dag. Om det ikke er tilfelle vil metoden fortsatt fungere, men den returnerer *null*. Og om jeg ikke tar høyde for det når jeg bruker den så smeller det.

    var file = GetNewestFileToday(@"C:\temp\");
    Console.WriteLine(file.LastWriteTime); // BOOM!

May foreslår at du endrer `GetNewestFileToday()` til å være tydelig på hva den kan returnere. Og det er ikke så vanskelig:

    public May<FileInfo> GetNewestFileToday(string folder)
    {
        var file = Directory.GetFiles(folder)
            .Select(f => new FileInfo(f))
            .Where(fi => fi.LastWriteTime > DateTime.Today)
            .OrderByDescending(fi => fi.LastWriteTime)
            .FirstOrDefault();
        return file != null ? file.Maybe() : May.NoValue;
    }

Returtypen er endret til `May<FileInfo>`, som sier at metoden *"may of may not"* returnere en fil. I tillegg undersøker jeg om jeg har en fil å returnere, og om jeg *ikke* har det så returnerer jeg `NoValue`.

*PS: Craig Gidney foreslår at navnekonvensjonen for metoder som returnerer May skal være at de starter på "May" - altså at jeg bør endre navnet til `MayGetNewestFileToday`. Jeg gjør ikke det her, men det kan kanskje være lurt.*

Et sentralt poeng her er at jeg **unngår null-testen alle steder hvor jeg benytter verdien ved å gjøre den én gang der hvor verdien produseres!**

Faktisk kan jeg gjøre endringen litt enklere, men jeg ville vise versjonen hvor jeg tester på null først. Ved å bruke en extension-metode i May som heter `MayFirst` blir metoden slik:

    public May<FileInfo> GetNewestFileToday(string folder)
    {
        return Directory.GetFiles(folder)
            .Select(f => new FileInfo(f))
            .Where(fi => fi.LastWriteTime > DateTime.Today)
            .OrderByDescending(fi => fi.LastWriteTime)
            .MayFirst();
    }

##Hvordan bruke May-verdier?

Men hvordan bruker jeg nå denne metoden? Jo, May-verdier er litt spesielle. Du forventer kanskje at de har en `HasValue` og en `Value` property, sånn som Nullable har - men det er ikke tilfelle. Du skal faktisk ikke gripe inn og hente ut verdien direkte. May tvinger deg til å ta stilling til om du har en verdi eller ikke ved å tilby deg noen hendige metoder som "simulerer" den typen **pattern matching** som du har i språk som Haskell og F#.

La oss som i forrige eksempel skrive ut `LastWriteTime`:

	var file = GetNewestFileToday(@"C:\temp\");
    Console.WriteLine(file.Match(
        fi => fi.LastWriteTime.ToString(),
        "No files changed today"));

Metoden `Match` gir meg indirekte tilgang til verdien, men tvinger meg samtidig til å angi en default verdi om file er `NoValue`.

Om du synes `Match` virker litt fremmed kan det hende du liker `Select` og `Else` bedre:

	var file = GetNewestFileToday(@"C:\temp\");
    Console.WriteLine(file
        .Select(fi => fi.LastWriteTime.ToString())
        .Else("No files changed today"));

Om det hjelper kan du se på en *option type* som en slags sekvens som enten inneholder *ingen* eller *ett* element. Du kan til og med bruke Linq-syntaks om du foretrekker:

    Console.WriteLine(
        (from f in file
         select f.LastWriteTime.ToString()
        ).Else("No files changed today"));

Eller du kan gjøre dette:

    file.IfHasValueThenDo(fi => Console.WriteLine(fi.LastWriteTime));

Eventuelt med en alternativ handling om verdien mangler:

    file.IfHasValueThenDo(fi => Console.WriteLine(fi.LastWriteTime))
        .ElseDo(() => Console.WriteLine("No files changed today"));

Dette er ikke nødvendigvis mindre støyende kode enn om man bruker null-tester, men option type gjør det mer sansynlig at du alle steder tar høyde for mulig fravær av verdi.

##Er du bekymret?

En bekymring du kanskje sitter med nå er at du må ta høyde for May<T> over alt, og at det kan bli ganske slitsomt. Men det er ikke helt sånn det er. Det du skal gjøre er å sørge for å returnere May<T> der hvor du produserer verdien, og å håndtere May<T> der hvor du til slutt skal vise verdien (sluttproduktet). For alt som skjer i mellom går det ofte an å _late som om May ikke finnes_.

For å forklare dette må jeg utvide mitt fantastiske eksempel. La oss lage tre metoder som representerer forretningslogikk for å kontrollere om et filnavn inneholder for mange banneord:

    public int CountBadWordsInName(FileInfo fi)
    {
        // Beklager ordbruken...
        var badWords = new[] { "fuck", "dick", "shit" };
        return badWords.Aggregate(0, (acc, word) 
            => acc + (fi.Name.Contains(word) ? 1 : 0));
    }

    public bool TooManyBadWords(int badWordCount)
    {
        return badWordCount > 1;
    }

    public string FileNameReport(bool tooManyBadWords)
    {
        return tooManyBadWords
            ? "File name contain too many bad words!"
            : "File name is fine :)";
    }

Legg merke til at disse metodene ikke har noe forhold til May. Hva skjer om jeg først har en `GetNewestFileToday()` som *ikke* bruker May<T>, og gjør følgende..?

    var file = GetNewestFileToday(@"C:\temp\");
    int badWordCount = CountBadWordsInName(file);
    bool tooManyBadWords = TooManyBadWords(badWordCount);
    Console.WriteLine(FileNameReport(tooManyBadWords));

Det kan selvfølgelig gå helt fint. Eller vi sklir på et bananskall og `CountBadWordsInName()` kaster en stygg NullReferenceException. Men om jeg i stedet bruker varianten som returnerer `May<FileInfo>` så kan jeg endre koden over til dette:

    Console.WriteLine(file
        .Select(CountBadWordsInName)
        .Select(TooManyBadWords)
        .Select(FileNameReport)
        .Else("No files today.."));

For det første er det mye penere; forhåpentligvis synes du det er mye tydeligere hva jeg gjør. For det andre har jeg benyttet forretningslogikk som ikke aner hva May er for noe. Det `Select` gjør er å kalle argumentfunksjonen hvis og bare hvis `file` har en verdi. Hvis den ikke har noen verdi vil bare denne "ikke-verdien" bli sendt videre til neste steg.

Det samme kan uttrykkes med Linq-syntax (om du ikke er glad i funksjonelle pipelines), for eksempel på denne måten :  

    Console.WriteLine(
        (from f in file
         select FileNameReport(
                  TooManyBadWords(
                    CountBadWordsInName(f)))
        ).Else("No files today.."));

..eller i en mere imperativ stil:

    Console.WriteLine(
        (from f in file
         let badWordCount = CountBadWordsInName(f)
         let tooMany = TooManyBadWords(badWordCount)
         select FileNameReport(tooMany)
        ).Else("No files today.."));

Jeg tror faktisk det er første gang jeg har brukt `let` i C#.

##Wrap-up

May-bibloteket (og option types generelt) vil kunne gjøre koden din tryggere ved å tvinge deg til å ta høyde for fravær av verdier der hvor du bruker det. Det vil prege koden din flere steder, men som du nå har sett behøver du ikke å innføre det over alt for å høste effekten.

Om du vil vite mer om May bør du ta en titt på blogposten [When null is not enough: an option type for C#](http://twistedoakstudios.com/blog/Post1130_when-null-is-not-enough-an-option-type-for-c), hvor du får vite alt du trenger om hvordan bibloteket ble til. Og når du er klar til å teste det selv så [finner du det på NuGet](https://www.nuget.org/packages/Strilanc.Value.May/).

Ble du inspirert til å lære mer om option types kan du kjøpe den tynne boken *[Maybe Haskell](https://gumroad.com/l/maybe-haskell)*, som gir deg en innføring i funksjonell programmeirng og Haskell ved å snakke om nettopp *Maybe*.

Og vil du se min første knoting med option types kan du lese kommentartråden på [en av mine tidligere bloggposter](http://blog.kjempekjekt.com/2015/01/10/fsharp-msisdn/), hvor jeg får litt gode råd om option types i F#.

...

Og så var det bare 21 dager igjen til Jul!
---
title: "Byggestener i et .NET-prosjekt"
layout: post
link: http://blog.kjempekjekt.com/2015/05/22/byggestener/
date: 2015-05-22T23:20:33.060Z
tags:
  - C#
---
Jeg sitter og leker meg med et lite prosjekt i C# hvor jeg lager en databaseserver. Ikke noe som skal brukes, dette er bare for å [*"finne opp hjulet"* som Brodwall sier](http://blog.kjempekjekt.com/2012/12/20/brodwall-finner-opp-hjulet-luke-20-2012/) (jeg satt egentlig å gjorde research på ulike typer databaser, men så kom inspirasjonen). Du finner prosjektet - LavaFlow - [på Github om du er interessert](https://github.com/tormaroe/lavaflow).

Vi står alle på skuldrene til kjemper, og i LavaFlow bruker jeg en rekke open source bibliotek som tilbyr meg nyttig funksjonalitet. Noen av dem har jeg brukt i årevis, andre er det første gang jeg prøver ut.

Så jeg tenkte at jeg skulle presentere dem her, i tilfelle det er .NET-utviklere der ute som er ukjente med noen av dem.

## Apache log4net

Det finnes mange logging-bibliotek, men jeg bruker alltid **[log4net](https://logging.apache.org/log4net/)**, og har gjort det nesten like lenge som jeg har kodet i C#. Ingen grunn til å bytte ut noe som fungerer så bra. 

![ColoredConsoleAppender](http://blog.kjempekjekt.com/uploads/2015/05/ColoredConsoleAppender.jpg)

log4net har mange ulike adaptere, og denne gangen bruker jeg `ColoredConsoleAppender`, som gir meg fin output i terminalvinduet.

## Nancy

**[Nancy](http://nancyfx.org/)** er et enkelt rammeverk for å lage HTTP-baserte tjenester, og dette har jeg også brukt mye. For å si det sånn: Takket være Nancy har jeg aldri hatt behov for å lære meg ASP.NET MVC, ASP.NET Web API, eller hva de nå heter nå, disse webrammeverkene fra Microsoft.

Nancy har hentet inspirasjonen fra [Sinatra](http://www.sinatrarb.com/), et minimalt webrammeverk for Ruby. Jeg har brukt det til å lage webløsninger som hostes i Internet Information Server, men Nancy kan også hostes i en konsollapplikasjon, eller som i dette tilfellet - i en windows service.

Her er et minimalt eksempel fra LavaFlow: Denne klassen definerer en rute (rett og slett `/`). Når noen gjør en HTTP GET mot denne vil Nancy laste et view som befinner deg i en fil som heter `main.html`.

    public class MainHandler : NancyModule
    {
        public MainHandler()
        {
            Get["/"] = _ => View["main"];
        }
    } 

Det fine er at jeg *ikke* har fortalt (konfigurert) Nancy hvor main.html befinner seg. Eller hvilken type view engine jeg bruker. Eller at `MainHandler` i det hele tatt eksisterer. Nancy bruker reflection til å finne alle moduler i prosjektet, og baserer seg ellers på fornuftige konvensjoner, som gjør at jeg raskt får opp en server som gjør det jeg vil, uten noe kjas og mas.

Her er et annet eksempel fra prosjektet hvor jeg lager en rute som returnerer et anonymt object som JSON. Parametrene til `AdminHandler` fyller Nancy automatisk inn ved hjelp av den innebygde IoC-containeren [TinyIoC](https://github.com/grumpydev/TinyIoC):

    public class AdminHandler : NancyModule
    {
        public AdminHandler(
            StorageActor storage, 
            AppSettingDataPath root) : base("admin")
        {
            Get["/status"] = _ =>
                Response.AsJson(new
                {
                    server = new {
                        version = Program.VERSION.ToString(),
                        started = Program.STARTED,
                        server_time = DateTime.UtcNow,
                        up_time = DateTime.UtcNow - Program.STARTED,
                        stored_count_since_start = storage.StoredCount,
                        storage_error_count = storage.ErrorCount,
                    },
                    storage = new
                    {
                        queue_length = storage.QueueLength,
                        queue_capasity = AppSettings.StorageQueueLimit,
                        size_in_bytes = root.SizeOnDisk,
                    }
                });
        }
    }

Finnes det enklere måter å lage RESTfulle APIer på i C#?

## Ninject

![Ninject](http://blog.kjempekjekt.com/uploads/2015/05/ninject.png)

**[Ninject](http://www.ninject.org/)** er en IoC-container jeg forelsket meg i for omtrent fem år siden, og biblioteket er det første jeg inkluderer når jeg trenger noe som skal holde orden på alle avhengighetene i prosjektene mine. 

I dette tilfellet derimot hadde jeg allerede TineIoC, ettersom det følger med Nancy. Så akkurat nå har jeg to ting som gjør det samme i prosjektet mitt, bare for to ulike deler. Dette ble bare tull, så Ninject må nok ut - men i skrivende stund er biblioteket i alle fall en del av løsningen. 

## Topshelf

![Topshelf](http://blog.kjempekjekt.com/uploads/2015/05/topshelf.png)

Dette er noe jeg har hatt lyst til å bruke lenge, men dette er første gang jeg gjør det. **[Topshelf](http://topshelf-project.com/)** er et rammeverk for å lage windows servicer. For det første gir det en *fluent DSL* for å definere tjenesten - hva den skal hete, hva den skal gjøre når den starter opp, hva den skal gjøre når det stoppes, hvilke rettigheter den skal ha, hvordan den skal oppføre seg når den kræsjer, og andre slike ting.

Når du så har gjort det, og bygger prosjektet, så ender du opp med en exe-fil med noen spesielle egenskaper. Den kan kjøres som et vanlig konsollprogram, og det er jo kjekt for testing. Men den er også klargjort for å ta imot en rekke opsjoner, som lar deg for eksempel installere tjenesten (én eller flere instanser), starte, stoppe og avinstallere den. Jeg behøver altså ikke lage noen egen windows service installer, takket være Topshelf.

Erfaringene sålangt er at Topshelf lever opp til forventningene, så denne anbefaler jeg glatt videre. 

## System.IO.Abstractions

LavaFlow er et prosjekt hvor jeg gjør mye filoperasjoner. **[System.IO.Abstractions](https://github.com/tathamoddie/System.IO.Abstractions)** tilbyr et abstraksjonslag over alle filoperasjonene i navnerommet `System.IO`. Det betyr at jeg ved å bruke dette kan *mocke ut* alle filoperasjonene i testene jeg skriver, og stort sett vil testene kjøre som om filoperasjonene faktisk ble gjort. System.IO.Abstractions gir meg altså et virtuelt filsystem!

Jeg har ikke brukt dette før, og har ikke kommet så veldig langt i å skrive tester som bruker det her heller. Men jeg synes ideen er svært spennende, så jeg håper biblioteket innfrir.

Jeg merket derimot at filoperasjonene tok *bitte litt* lengre tid da jeg byttet ut System.IO med System.IO.Abstractions. Det var så lite at det i de fleste tilfeller nok ikke vil være noe problem, og dessuten kan jeg sikkert gjøre litt ytelsesprofilering og kanskje finne noen problemområder jeg kan fikse på, men litt skuffet ble jeg jo :)

## Json.NET (fra Newtonsoft)

![Json.NET](http://blog.kjempekjekt.com/uploads/2015/05/json.net.jpg)

**[Json.NET](http://www.newtonsoft.com/json)** er det mest nedlastede biblioteket fra NuGet, og brukes til å serialisere .NET-objekter til/fra JSON. Ikke så mye mer å si egentlig :)

*PS: Er du interessert i serialisering kan du også lese min [blogpost om kompakt serialisering med MessagePack](http://blog.kjempekjekt.com/2015/05/12/kompakt-serialisering-med-messagepack/).*

## NUnit

Når jeg skal skrive tester i C# bruker jeg nesten alltid **[NUnit](http://www.nunit.org/)**. Det finnes noen nokså like alternativer, som for eksempel [xUnit.net](http://xunit.github.io/), men jeg ser ingen grunn til å bytte ut det biblioteket jeg har brukt i så mange år.

*(Derimot har jeg av og til brukt [machine.specifications](https://github.com/machine/machine.specifications) (a.k.a. MSpec) og [specflow](http://www.specflow.org/), men det er når jeg føler den typen spesifikasjoner passer bedre til å dokumentere funksjonaliteten. NUnit er verktøyet jeg strekker meg etter først.)*

## Fluent Assertions

For å skrive tester som "flyter bedre" har jeg tatt i bruk **[Fluent Assertions](http://www.fluentassertions.com/)**. Her er et eksempel fra på hvordan dette ser ut i bruk fra en test i LavaFlow:

    var db_keys = client.GetKeysAsync(test_aggregate).Result;
    db_keys.Should().HaveCount(1);
    db_keys.Should().Contain("key_one");

[NFluent](http://www.n-fluent.net/) er et alternativ som jeg synes trekker strikken litt for langt.

## AppVeyor

**[AppVeyor](http://www.appveyor.com/)** er ikke et bibliotek eller rammeverk, men en tjeneste - *en byggemotor* - som jeg benytter for første gang i dette prosjektet. AppVeyor bygger LavaFlow hver gang jeg pusher endringer til Github, og gir meg en fin liten badge som sier om siste bygg er ok eller ikke:

[![Build status](https://ci.appveyor.com/api/projects/status/v9tlafdwjb3hu2n9/branch/master?svg=true)](https://ci.appveyor.com/project/tormaroe/lavaflow/branch/master)

## .. til slutt

LavaFlow er ment å være en lekegrind hvor jeg kan eksperimentere, og etterhvert kan det tenkes jeg legger til avhengigheter til enda flere bibliotek. Blant annet inneholder det en hjemmesnekret [Actor](http://blog.kjempekjekt.com/tags/actor-model/), og jeg har tenkt på å bytte dette ut med [Akka.NET](http://getakka.net/). 

Men det får bli en egen blogpost...
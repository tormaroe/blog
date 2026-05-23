---
scratch: true
title: "Kompakt serialisering med MessagePack"
layout: post
link: http://blog.kjempekjekt.com/2015/05/12/kompakt-serialisering-med-messagepack/
date: 2015-05-12T23:11:40.397Z
tags:
  - C#
  - Software/verktøy
  - Ytelse
---

**MessagePack** er et binært serialiseringsformat. Omtrent som JSON, bare raskere og mer kompakt (..er slagordet på [msgpack.org](http://msgpack.org/)).

Et bilde på internett indikerer at dette kan være noe jeg bør se nærmere på: 

![Et random bilde fra internett](http://blog.kjempekjekt.com/uploads/2015/05/speedtest.png)

JSON er normalt veldig greit å bruke i mange sammenhenger, men når antall bytes er viktig blir JSON unødvendig stort. For eksempel om du skal lagre en masse data i memcached eller Redis, eller sende mange meldinger gjennom beanstalkd eller RabbitMQ. Da er MessagePack er bra alternativ.

Ikke nødvendigvis fordi man ikke har plass til å lagre mye data, men fordi ting går raskere når det er *mindre data som skal sendes over nettverket eller skrives til disk*.

Det finnes MessagePack-bibliotek til alle populære programmeringsspråk. I denne artikkelen vil jeg vise hvordan man bruker ett av dem - i C#. Jeg vil også sammenligne dette med alternativer som JSON-serialisering og .NET binærserialisering, og se hvor mye bedre MessagePack er.

## MsgPack.Cli

Det finnes flere MessagePack-bibliotek for .NET, men jeg valgte [MsgPack.Cli](http://www.nuget.org/packages/MsgPack.Cli/) fordi det har et enkelt API som tilbyr serialisering av vilkårlige objekter.

Installer med NuGet:

    PM> Install-Package MsgPack.Cli

Først trenger jeg noe data å lagre. Jeg lager meg en datamodell for å beskrive TV-serier med tilhørende sitater:

    [Serializable]
    public class TvSeries
    {
        public string Title { get; set; }
        public int NoOfEpisodes { get; set; }
        public IEnumerable<string> Genres { get; set; }
        public IEnumerable<Quote> Quotes { get; set; }
    }

    [Serializable]
    public class Quote
    {
        public string By { get; set; }
        public int Season { get; set; }
        public int Episode { get; set; }
        public string Text { get; set; }
    }

`Serializable`-attributtet er ikke nødvendig for å bruke MsgPack, men blir nødvendig når jeg senere skal bruke vanlig .NET-serialisering. Det er også uansett en god konvensjon å markere typer som skal kunne serialiseres med dette attributtet.

La oss så instansiere et objekt:

    var doctorWho = new TvSeries
    {
        Title = "Doctor Who",
        NoOfEpisodes = 813,
        Genres = new[] { "Drama", "Adventure", "Sci-Fi" },
        Quotes = new[] {
            new Quote 
            { 
                By = "The Doctor", 
                Season = 5,
                Episode = 13,
                Text = "We’re all stories, in the end. "
                    + "Just make it a good one, eh?" 
            },
            new Quote 
            { 
                By = "The Doctor", 
                Season = 5,
                Episode = 12,
                Text = "The universe is big. It’s vast and complicated "
                    + "and ridiculous. And sometimes, very rarely, "
                    + "impossible things just happen and we call them "
                    + "miracles." 
            },
        }
    };

Og så er det på tide å serialisere. Jeg vil lagre en serialisert versjon av objektet `doctorWho` til en fil. Jeg trenger et par usings...

    using System.IO;
    using MsgPack.Serialization;

.. og så serialiserer jeg:

    var serializer = SerializationContext.Default
        .GetSerializer<TvSeries>();

    using (var stream = File.OpenWrite(@"c:\temp\packtest"))
        serializer.Pack(stream, doctorWho);

Det var jo enkelt. Tar jeg nå en titt i `c:\test` finner jeg filen `packtest` som er på 284 bytes. Åpner jeg den i Sublime Text ser det slik ut:

    9493 a544 7261 6d61 a941 6476 656e 7475
    7265 a653 6369 2d46 69d1 032d 9294 aa54
    6865 2044 6f63 746f 720d 05da 003d 5765
    e280 9972 6520 616c 6c20 7374 6f72 6965
    732c 2069 6e20 7468 6520 656e 642e 204a
    7573 7420 6d61 6b65 2069 7420 6120 676f
    6f64 206f 6e65 2c20 6568 3f94 aa54 6865
    2044 6f63 746f 720c 05da 0095 5468 6520
    756e 6976 6572 7365 2069 7320 6269 672e
    2049 74e2 8099 7320 7661 7374 2061 6e64
    2063 6f6d 706c 6963 6174 6564 2061 6e64
    2072 6964 6963 756c 6f75 732e 2041 6e64
    2073 6f6d 6574 696d 6573 2c20 7665 7279
    2072 6172 656c 792c 2069 6d70 6f73 7369
    626c 6520 7468 696e 6773 206a 7573 7420
    6861 7070 656e 2061 6e64 2077 6520 6361
    6c6c 2074 6865 6d20 6d69 7261 636c 6573
    2eaa 446f 6374 6f72 2057 686f 

En binærfil altså. Bruker jeg en Hex-editor til å tolke *bytes'ene* ser jeg at det aller meste er strengene fra `doctorWho`-objektet. Resten er bytes utenfor normal ASCII-range.

    ...Drama.Adventure.Sci-Fi..-...T
    he Doctor....=We...re all storie
    s, in the end. Just make it a go
    od one, eh?..The Doctor.....The 
    universe is big. It...s vast and
     complicated and ridiculous. And
     sometimes, very rarely, impossi
    ble things just happen and we ca
    ll them miracles..Doctor Who

La oss se hvordan vi så leser inn igjen objektet fra filen og skriver ut et av sitatene:

    using (var stream = File.OpenRead(@"c:\temp\packtest"))
    {
        TvSeries series = serializer.Unpack(stream);
        Console.WriteLine(series.Quotes.First().Text);
    }

Enklere blir det ikke, og takket være *generics* jobber jeg kun med statiske typer.

## ..sammenlignet med JSON

Det jeg normalt gjør - fordi det er enkelt å gjøre og enkelt å forholde seg til - er å bruke JSON. Så la oss bruke [Json.NET](http://www.nuget.org/packages/Newtonsoft.Json/) (som forresten er det aller mest populære prosjektet på NuGet):

    PM> Install-Package Newtonsoft.Json

Og ikke glem usings...

    using Newtonsoft.Json;

Serialiser og skriv til fil:

    File.WriteAllText(@"C:\temp\test.json", 
        JsonConvert.SerializeObject(doctorWho), 
        Encoding.UTF8);

Veldig enkelt. Men selv om JSON-strengen som lagres er så kompakt som man får den så blir dette dokumentet på 413 bytes, som er endel mer enn med MessagePack-formatet.

La oss for kompletthets skyld også vise deserialisering:

    var json = File.ReadAllText(@"C:\temp\test.json", Encoding.UTF8);
    TvSeries fromJson = JsonConvert.DeserializeObject<TvSeries>(json);
    Console.WriteLine(fromJson.Quotes.First().Text);

## ..sammenlignet med BSON

Hva med [BSON](http://en.wikipedia.org/wiki/BSON) da? Binær-JSON er designet for å være et mere effektivt lagringsformat, og brukes for eksempel av mongoDB. Json.NET støtter også BSON, 

    using Newtonsoft.Json.Bson;

.. så la oss teste dette:

    using (var stream = File.OpenWrite(@"c:\temp\bsontest"))
    using (var writer = new BsonWriter(stream))
        new JsonSerializer().Serialize(writer, doctorWho);

Hva tror du - ble dette bedre? Neida, i dette tilfellet bruker BSON-serialisering mer plass enn JSON: 451 bytes. Wikipedia sier:

> In some cases, BSON will use more space than JSON..

Deserialisering:

    using (var stream = File.OpenRead(@"c:\temp\bsontest"))
    using (var reader = new BsonReader(stream))
    {
        var fromBson = new JsonSerializer()
            .Deserialize<TvSeries>(reader);
        Console.WriteLine(fromBson.Quotes.First().Text);
    }

## ..sammenlignet med BinaryFormatter

.NET har en *ut-av-boksen* løsning for binærserialiseringen, som jeg har brukt for leeeeenge siden når jeg hadde behov for kompakt serialisering. Mer kompakt enn XML-serialisering vel å merke. For å bruke dette må vi først inkludere..

    using System.Runtime.Serialization.Formatters.Binary;

Og så kan vi bruke `BinaryFormatter` til å serialisere rett til en stream:

    using (var stream = File.OpenWrite(@"c:\temp\binarytest"))
        new BinaryFormatter().Serialize(stream, doctorWho);

Like enkelt som de andre eksemplene, men hva med resultatet? `binarytest`-filen ender på 816 bytes, nesten dobbelt så mye som for JSON. Grunnen er at halvparten av filen inneholder metadata om typen som er serialisert - blant annet hvilken assembly den kommer fra.

En annen ulempe med å bruke dette er at formatet er proprietært - det kan i praksis kun brukes fra .NET, mens JSON og MessagePack er universelle formater.

Men før vi går videre, la oss ta med hvordan vi deserialiserer:

    using (var stream = File.OpenRead(@"c:\temp\binarytest"))
    {
        var fromBinary = new BinaryFormatter()
            .Deserialize(stream) as TvSeries;
        Console.WriteLine(fromBinary.Quotes.First().Text);
    }

Dette API'et stammer fra før vi fikk generics i .NET, så her må jeg kaste objektet til typen `TvSeries`.

## ..sammenlignet med GZip

For et par år siden brukte jeg et open source prosjekt som heter [BinaryRage](https://github.com/mchidk/BinaryRage). Ja faktisk bidro jeg med et par commits også. BinaryRage er en *key/value-database* designet for å være **ultrarask**. Og en teknikk som brukes er å binærserialisere, men så *gzippe* bytes'ene før de lagres til disk.

Navnerommet du trenger er:

    using System.IO.Compression;

Og så gjør du noe sånt som dette:

    using (var stream = File.OpenWrite(@"c:\temp\compresstest"))
    using (var zip = new GZipStream(stream, CompressionLevel.Optimal))
        new BinaryFormatter().Serialize(zip, doctorWho);

Jeg wrapper altså en filstrøm med en gzipstrøm, og så serialiserer jeg til denne. Så hvor mye bedre blir dette?

For eksempel-objektet mitt ender vi opp med en fil på 484 bytes. Det er jo mye bedre enn uten komprimering, men kanskje overraskende nok dårligere enn JSON!

Ja, ja. Vi må likevel se hvordan vi deserialiserer:

    using (var stream = File.OpenRead(@"c:\temp\compresstest"))
    using (var zip = new GZipStream(stream, CompressionMode.Decompress))
    {
        var fromBinary = new BinaryFormatter()
            .Deserialize(zip) as TvSeries;
        Console.WriteLine(fromBinary.Quotes.First().Text);
    }

De ulike formatene, side ved side:

![Sammenligning av serialiseringsformater](http://blog.kjempekjekt.com/uploads/2015/05/msgpack_bytes.png)

## Andre alternativ

Det finnes noen andre, populære serialiseringsformat med samme bruksområde som MessagePack, men som jeg ikke har noe særlig erfaring med. Jeg tenker på **[Protocol Buffers](https://developers.google.com/protocol-buffers/)** utviklet av Google, og **[Apache Thrift](http://thrift.apache.org/)**.

Det jeg ikke liker med disse er at de (såvidt jeg har forstått) baserer seg på en skjema-definisjon og kodegenerering. Dette gir sikkert god kontroll og fleksibilitet på formatet, men tilfører også kompleksitet. MessagePack derimot virker nesten like enkelt å bruke som JSON, med unntak av at resultatet ikke er særlig lesbart for mennesker.

## Konsumere objektet med et annet språk

En del av lovnaden med MessagePack er at dataene skal kunne brukes på tvers av ulike platformer og språk. Så la meg til slutt teste det. Jeg velger Ruby denne gangen, og installerer en MessagePack gem:

    $ gem install msgpack

Nå kan jeg lese filen jeg serialiserte til fra C#, pakke den opp, og se hva jeg får ut:

    require 'msgpack'
    msg = File.read 'c:\\temp\\packtest'
    obj = MessagePack.unpack msg

Jeg har her ikke noe objekttype jeg deserialiserer til - og såvidt jeg kan se støtter ikke dette biblioteket deserialisering til definerte typer heller. I stedet får jeg ut et array med alle verdiene, omtrent som dette:

    [["Drama", "Adventure", "Sci-Fi"],
     813,
     [["The Doctor",
       13,
       5,
       "We\u2019re all stories, in the end. Just make it a good one, eh?"],
      ["The Doctor",
       12,
       5,
       "The universe is big. It\u2019s vast and complicated and ......."]],
     "Doctor Who"]

Her må jeg ha kjennskap til hvordan MsgPack.Cli serialiserte objektmodellen min for å vite hvordan jeg skal bruke resultatet. Det er her Protocol Buffers er bedre, fordi man definerer et skjema som kan brukes til å generere kode i både C# og Ruby. JSON er også bedre fordi skjemaet (feltnavn) følger med dataene. Men i mange tilfeller - hvor antall bytes er essensielt - vil MessagePack være helt greit å forholde seg til... tenker jeg...

Eksempelet mitt er selvfølgelig alt for banalt til å gi et bastant svar på hva som er best i en hvilken som helst kontekst. Når man står overfor en reell case hvor ytelse er viktig så bør man eksperimentere og måle hva som er best i det konkrete tilfellet.

Men neste gang *jeg* skal cache data i for eksempel Redis, eller sende mange meldinger raskt over en meldingskø, så kommer jeg nok sikkert til å forsøke MessagePack - for dette likte jeg :)

Gjorde du?